-- Fix RLS: allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RPC for updating own profile (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION update_my_profile(p_first_name TEXT, p_last_name TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;

  UPDATE profiles
  SET first_name = p_first_name,
      last_name = p_last_name,
      updated_at = NOW()
  WHERE id = v_user_id;
END;
$$;

-- RPC to get profile names by IDs (for timeline, audit, etc.)
CREATE OR REPLACE FUNCTION get_profile_names(p_ids UUID[])
RETURNS TABLE (id UUID, display_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, (p.first_name || ' ' || p.last_name) AS display_name
  FROM profiles p
  WHERE p.id = ANY(p_ids);
END;
$$;