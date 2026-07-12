-- =============================================================================
-- P1 Improvements Migration for Legalyx CMS
-- =============================================================================

-- 1. Full-text search: enable pg_trgm and create GIN index
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Update get_dossiers RPC to use pg_trgm for better search
CREATE OR REPLACE FUNCTION get_dossiers(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID, numero TEXT, titre TEXT, description TEXT,
  juridiction TEXT, status dossier_status,
  created_by UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.numero, d.titre, d.description, d.juridiction,
         d.status, d.created_by, d.created_at, d.updated_at
  FROM dossiers d
  WHERE d.deleted_at IS NULL
    AND (p_search IS NULL OR
         d.numero ILIKE '%' || p_search || '%' OR
         d.titre ILIKE '%' || p_search || '%' OR
         d.description ILIKE '%' || p_search || '%' OR
         d.juridiction ILIKE '%' || p_search || '%')
    AND (p_status IS NULL OR d.status::TEXT = p_status)
  ORDER BY 
    CASE WHEN p_search IS NOT NULL THEN 
      similarity(d.titre, p_search) + similarity(d.numero, p_search)
    ELSE 0 END DESC,
    d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Add GIN trigram index for faster search
CREATE INDEX IF NOT EXISTS idx_dossiers_search_trgm ON dossiers 
  USING GIN (titre gin_trgm_ops, numero gin_trgm_ops);

-- 2. Documents table for file uploads
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT DEFAULT 'piece_jointe',
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documents" ON documents FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and greffiers can upload documents" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GREFFIER'))
);

CREATE POLICY "Admins can delete documents" ON documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RPC: Get documents for a dossier
CREATE OR REPLACE FUNCTION get_documents_for_dossier(p_dossier_id UUID)
RETURNS TABLE (
  id UUID, filename TEXT, original_name TEXT, file_size BIGINT,
  mime_type TEXT, category TEXT, storage_path TEXT,
  uploaded_by UUID, created_at TIMESTAMPTZ,
  uploader_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.filename, d.original_name, d.file_size, d.mime_type,
         d.category, d.storage_path, d.uploaded_by, d.created_at,
         COALESCE(p.first_name || ' ' || p.last_name, 'Inconnu')
  FROM documents d
  LEFT JOIN profiles p ON p.id = d.uploaded_by
  WHERE d.dossier_id = p_dossier_id
  ORDER BY d.created_at DESC;
END;
$$;

-- RPC: Get all documents with dossier info (for documents page)
CREATE OR REPLACE FUNCTION get_all_documents(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, original_name TEXT, file_size BIGINT,
  mime_type TEXT, category TEXT, created_at TIMESTAMPTZ,
  uploader_name TEXT,
  dossier_id UUID, dossier_numero TEXT, dossier_titre TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.original_name, d.file_size, d.mime_type, d.category,
         d.created_at,
         COALESCE(p.first_name || ' ' || p.last_name, 'Inconnu'),
         dos.id, dos.numero, dos.titre
  FROM documents d
  LEFT JOIN profiles p ON p.id = d.uploaded_by
  LEFT JOIN dossiers dos ON dos.id = d.dossier_id
  ORDER BY d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- RPC: Delete a document (soft - removes storage ref)
CREATE OR REPLACE FUNCTION delete_document(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_path TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;
  SELECT storage_path INTO v_path FROM documents WHERE id = p_id;
  DELETE FROM documents WHERE id = p_id;
  -- Note: actual file deletion from storage bucket must be done client-side
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'DELETE_DOCUMENT', 'document', p_id,
          jsonb_build_object('storage_path', v_path));
END;
$$;

-- RPC: Count documents
CREATE OR REPLACE FUNCTION count_documents()
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

-- 3. Audit improvements: block modifications/deletions on audit_logs
CREATE OR REPLACE FUNCTION block_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Les journaux d''audit sont immuables et ne peuvent pas être modifiés ni supprimés.'
    USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_no_delete ON audit_logs;

CREATE TRIGGER audit_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION block_audit_modification();

CREATE TRIGGER audit_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION block_audit_modification();

-- 4. Audit helper: log with IP and user agent
CREATE OR REPLACE FUNCTION log_audit_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_details, '{}'::jsonb) || 
      CASE WHEN p_ip IS NOT NULL THEN jsonb_build_object('ip', p_ip) ELSE '{}'::jsonb END ||
      CASE WHEN p_user_agent IS NOT NULL THEN jsonb_build_object('user_agent', p_user_agent) ELSE '{}'::jsonb END,
    NOW()
  );
END;
$$;

-- 5. Dossier status timeline
CREATE TABLE IF NOT EXISTS dossier_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  old_status dossier_status,
  new_status dossier_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dossier_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view status history" ON dossier_status_history FOR SELECT 
  USING (auth.role() = 'authenticated');

-- RPC: Get status timeline for a dossier
CREATE OR REPLACE FUNCTION get_dossier_timeline(p_dossier_id UUID)
RETURNS TABLE (
  id UUID, old_status dossier_status, new_status dossier_status,
  changed_by UUID, comment TEXT, created_at TIMESTAMPTZ,
  changer_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.old_status, h.new_status, h.changed_by, h.comment, h.created_at,
         COALESCE(p.first_name || ' ' || p.last_name, 'Système')
  FROM dossier_status_history h
  LEFT JOIN profiles p ON p.id = h.changed_by
  WHERE h.dossier_id = p_dossier_id
  ORDER BY h.created_at DESC;
END;
$$;

-- 6. Update create_dossier to accept IP and user agent
CREATE OR REPLACE FUNCTION create_dossier(
  p_titre TEXT,
  p_description TEXT,
  p_juridiction TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, numero TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_new_id UUID;
  v_new_numero TEXT;
  v_details JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER') THEN
    RAISE EXCEPTION 'Accès refusé: rôle insuffisant' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;
  INSERT INTO dossiers (titre, description, juridiction, created_by)
  VALUES (p_titre, p_description, p_juridiction, v_user_id)
  RETURNING id, numero INTO v_new_id, v_new_numero;

  v_details := jsonb_build_object('numero', v_new_numero, 'titre', p_titre, 'juridiction', p_juridiction);
  IF p_ip IS NOT NULL THEN v_details := v_details || jsonb_build_object('ip', p_ip); END IF;
  IF p_user_agent IS NOT NULL THEN v_details := v_details || jsonb_build_object('user_agent', p_user_agent); END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'CREATE_DOSSIER', 'dossier', v_new_id, v_details);

  id := v_new_id;
  numero := v_new_numero;
  RETURN NEXT;
END;
$$;

-- 7. Update update_dossier_status to record timeline
CREATE OR REPLACE FUNCTION update_dossier_status(p_id UUID, p_new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_old_status dossier_status;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER', 'JUGE') THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  -- Get old status
  SELECT status INTO v_old_status FROM dossiers WHERE id = p_id AND deleted_at IS NULL;
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Dossier introuvable' USING ERRCODE = 'NOT_FOUND';
  END IF;
  IF v_old_status = p_new_status::dossier_status THEN
    RETURN; -- No change needed
  END IF;

  UPDATE dossiers
  SET status = p_new_status::dossier_status, updated_at = NOW()
  WHERE id = p_id AND deleted_at IS NULL;

  -- Record in timeline
  INSERT INTO dossier_status_history (dossier_id, old_status, new_status, changed_by)
  VALUES (p_id, v_old_status, p_new_status::dossier_status, v_user_id);

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'UPDATE_DOSSIER_STATUS', 'dossier', p_id,
          jsonb_build_object('old_status', v_old_status::TEXT, 'new_status', p_new_status));
END;
$$;