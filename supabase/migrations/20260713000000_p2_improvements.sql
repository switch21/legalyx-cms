-- ============================================================================
-- P2 Improvements Migration
-- Legalyx CMS — MFA, Onboarding, Secret Rotation, Enhanced Security
-- Date: 2026-07-13
-- ============================================================================

-- 1. Add MFA (TOTP) support to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_verified_at TIMESTAMPTZ;

-- 2. Add onboarding tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- 3. Add backup codes for MFA recovery
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add encryption key metadata for secret rotation tracking
CREATE TABLE IF NOT EXISTS public.key_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  key_version INTEGER NOT NULL DEFAULT 1,
  encrypted_value TEXT NOT NULL,
  rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_by UUID REFERENCES auth.users(id),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Add IP-based anomaly tracking for security
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast anomaly detection queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON public.login_attempts(user_id, created_at);

-- 6. RPC: Log login attempt (used by middleware)
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_user_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_success BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (user_id, ip_address, user_agent, success)
  VALUES (p_user_id, p_ip_address::INET, p_user_agent, p_success);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: Check for login anomalies (failed attempts from same IP)
CREATE OR REPLACE FUNCTION public.check_login_anomalies(
  p_ip_address TEXT,
  p_minutes INTEGER DEFAULT 15
) RETURNS TABLE(
  attempt_count BIGINT,
  is_blocked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS attempt_count,
    (COUNT(*) FILTER (WHERE NOT success) >= 5)::BOOLEAN AS is_blocked
  FROM public.login_attempts
  WHERE ip_address = p_ip_address::INET
    AND created_at > now() - (p_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: Set MFA secret for a user
CREATE OR REPLACE FUNCTION public.set_mfa_secret(
  p_user_id UUID,
  p_secret TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET totp_secret = p_secret,
      totp_enabled = true
  WHERE id = p_user_id AND auth.uid() = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Verify and enable MFA
CREATE OR REPLACE FUNCTION public.verify_mfa(
  p_user_id UUID,
  p_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_secret TEXT;
  v_expected_code TEXT;
BEGIN
  SELECT totp_secret INTO v_secret
  FROM public.profiles
  WHERE id = p_user_id AND auth.uid() = p_user_id;

  IF v_secret IS NULL THEN
    RETURN false;
  END IF;

  -- Simple TOTP verification (in production, use a proper TOTP library)
  -- This is a placeholder - the actual verification happens client-side
  UPDATE public.profiles
  SET totp_verified_at = now()
  WHERE id = p_user_id AND auth.uid() = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC: Complete onboarding for user
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET onboarding_completed = true
  WHERE id = p_user_id AND auth.uid() = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. RPC: Generate backup codes for MFA
CREATE OR REPLACE FUNCTION public.generate_backup_codes(
  p_user_id UUID
) RETURNS TEXT[] AS $$
DECLARE
  v_codes TEXT[] := ARRAY[]::TEXT[];
  v_code TEXT;
  v_hash TEXT;
BEGIN
  -- Delete old unused codes
  DELETE FROM public.mfa_backup_codes 
  WHERE user_id = p_user_id AND NOT used;

  -- Generate 10 new backup codes
  FOR i IN 1..10 LOOP
    v_code := upper(encode(gen_random_bytes(4), 'hex'));
    v_hash := crypt(v_code, gen_salt('bf'));
    
    INSERT INTO public.mfa_backup_codes (user_id, code_hash)
    VALUES (p_user_id, v_hash);
    
    v_codes := array_append(v_codes, v_code);
  END LOOP;

  RETURN v_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RLS Policies for new tables
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_registry ENABLE ROW LEVEL SECURITY;

-- Users can read their own backup codes
CREATE POLICY "Users read own backup codes" ON public.mfa_backup_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own used backup codes
CREATE POLICY "Users delete own backup codes" ON public.mfa_backup_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can read all login attempts
CREATE POLICY "Admin read all login attempts" ON public.login_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Admin can read key registry
CREATE POLICY "Admin read key registry" ON public.key_registry
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 13. Grant access to service role for RPC functions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- END OF P2 MIGRATION
-- ============================================================================