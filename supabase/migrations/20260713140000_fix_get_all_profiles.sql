-- Fix: ambiguous column reference "role" in get_all_profiles
-- The function return type has a column named "role" which clashes with profiles.role
DROP FUNCTION IF EXISTS get_all_profiles();
CREATE FUNCTION get_all_profiles()
RETURNS TABLE (
  id UUID, first_name TEXT, last_name TEXT,
  role user_role, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;

  SELECT p.role INTO v_role FROM profiles p WHERE p.id = v_user_id;
  IF v_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.role, p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;