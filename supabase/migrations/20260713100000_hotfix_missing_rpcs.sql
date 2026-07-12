-- =============================================================================
-- Hotfix: Add missing RPC functions that the frontend calls
-- =============================================================================

-- 1. get_my_profile — used by Header.tsx (now uses direct query, but kept for safety)
DROP FUNCTION IF EXISTS get_my_profile();
CREATE FUNCTION get_my_profile()
RETURNS TABLE (
  id UUID, first_name TEXT, last_name TEXT,
  role user_role, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;

  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.role, p.created_at
  FROM profiles p
  WHERE p.id = v_user_id;
END;
$$;

-- 2. get_dossier_timeline — used by dossiers/[id]/page.tsx
DROP FUNCTION IF EXISTS get_dossier_timeline(UUID);
CREATE FUNCTION get_dossier_timeline(p_dossier_id UUID)
RETURNS TABLE (
  id UUID, action TEXT, created_at TIMESTAMPTZ, details JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT al.id, al.action, al.created_at, al.details
  FROM audit_logs al
  WHERE al.entity_type = 'dossier' AND al.entity_id = p_dossier_id
  ORDER BY al.created_at ASC;
END;
$$;

-- 3. log_audit_action — used by documents.ts server action
DROP FUNCTION IF EXISTS log_audit_action(TEXT, TEXT, JSONB, UUID, TEXT);
CREATE FUNCTION log_audit_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_details JSONB DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_ip TEXT DEFAULT NULL
)
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

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    v_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_details, '{}'::JSONB)
  );
END;
$$;

-- 4. get_all_documents — used by documents/page.tsx
DROP FUNCTION IF EXISTS get_all_documents(INT, INT);
CREATE FUNCTION get_all_documents(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, dossier_id UUID, file_name TEXT, file_size BIGINT,
  category TEXT, file_path TEXT, uploaded_by UUID, created_at TIMESTAMPTZ,
  dossier_numero TEXT, dossier_titre TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.dossier_id, d.file_name, d.file_size,
         d.category, d.file_path, d.uploaded_by, d.created_at,
         ds.numero AS dossier_numero, ds.titre AS dossier_titre
  FROM documents d
  LEFT JOIN dossiers ds ON ds.id = d.dossier_id
  ORDER BY d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 5. count_documents — used by documents/page.tsx
DROP FUNCTION IF EXISTS count_documents();
CREATE FUNCTION count_documents()
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM documents;
  RETURN v_count;
END;
$$;

-- 6. RLS: Allow authenticated users to read audit_logs (needed for dashboard activity feed)
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can view audit logs" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');