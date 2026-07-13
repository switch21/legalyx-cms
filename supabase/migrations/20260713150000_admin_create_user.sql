-- =============================================================================
-- Admin user creation + role update RPCs
-- =============================================================================

-- 1. RPC: admin_create_user — creates an auth user + profile with specified role
--    Only ADMIN can call this. The trigger still fires but the role passed via
--    raw_user_meta_data will be overridden by the INSERT ... ON CONFLICT DO UPDATE
--    inside this function.
CREATE OR REPLACE FUNCTION admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role user_role DEFAULT 'PARTIE'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
  v_new_user_id UUID;
BEGIN
  -- Verify caller is authenticated
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Non authentifié');
  END IF;

  -- Verify caller is ADMIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = v_admin_id;
  IF v_admin_role != 'ADMIN' THEN
    RETURN jsonb_build_object('error', 'Accès réservé aux administrateurs');
  END IF;

  -- Validate inputs
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object('error', 'L''email est requis');
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RETURN jsonb_build_object('error', 'Le mot de passe est requis');
  END IF;

  IF p_first_name IS NULL OR p_first_name = '' THEN
    RETURN jsonb_build_object('error', 'Le prénom est requis');
  END IF;

  IF p_last_name IS NULL OR p_last_name = '' THEN
    RETURN jsonb_build_object('error', 'Le nom est requis');
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object('error', 'Un utilisateur avec cet email existe déjà');
  END IF;

  -- Create the auth user using Supabase's internal API
  -- We use insert into auth.users with the required fields
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role,
    confirmation_token
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::JSONB,
    jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'role', p_role::TEXT),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    ''
  )
  RETURNING id INTO v_new_user_id;

  -- The trigger handle_new_user() will fire and create a profile with the
  -- role determined by the hardcoded email list. Since the new email won't
  -- match any, it will default to PARTIE. We override it here:
  INSERT INTO profiles (id, first_name, last_name, role)
  VALUES (v_new_user_id, p_first_name, p_last_name, p_role)
  ON CONFLICT (id) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;

  -- Audit log
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    v_admin_id,
    'CREATE_USER',
    'user',
    v_new_user_id,
    jsonb_build_object('email', p_email, 'role', p_role::TEXT, 'first_name', p_first_name, 'last_name', p_last_name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_new_user_id,
    'email', p_email,
    'message', 'Utilisateur créé avec succès'
  );
END;
$$;

-- 2. RPC: admin_update_user_role — allows ADMIN to change a user's role
CREATE OR REPLACE FUNCTION admin_update_user_role(
  p_target_user_id UUID,
  p_new_role user_role
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_role TEXT;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Non authentifié');
  END IF;

  SELECT role INTO v_admin_role FROM profiles WHERE id = v_admin_id;
  IF v_admin_role != 'ADMIN' THEN
    RETURN jsonb_build_object('error', 'Accès réservé aux administrateurs');
  END IF;

  IF p_target_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Identifiant utilisateur requis');
  END IF;

  -- Prevent admin from changing their own role
  IF v_admin_id = p_target_user_id THEN
    RETURN jsonb_build_object('error', 'Vous ne pouvez pas modifier votre propre rôle');
  END IF;

  -- Verify target user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_target_user_id) THEN
    RETURN jsonb_build_object('error', 'Utilisateur introuvable');
  END IF;

  UPDATE profiles
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_target_user_id;

  -- Audit
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    v_admin_id,
    'UPDATE_USER_ROLE',
    'user',
    p_target_user_id,
    jsonb_build_object('new_role', p_new_role::TEXT)
  );

  RETURN jsonb_build_object('success', true, 'message', 'Rôle mis à jour');
END;
$$;