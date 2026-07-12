-- =============================================================================
-- P0 Improvements Migration for Legalyx CMS
-- =============================================================================

-- 1. Soft delete column for dossiers
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_dossiers_not_deleted ON dossiers (id) WHERE deleted_at IS NULL;

-- 2. RLS Policies for UPDATE and DELETE (soft delete)
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

-- Allow admins and greffiers to update dossiers
CREATE POLICY "Admins and greffiers can update dossiers" ON dossiers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GREFFIER'))
);

-- Allow admins to soft-delete dossiers
CREATE POLICY "Admins can delete dossiers" ON dossiers FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 3. RLS Policies for audiences (INSERT, UPDATE, DELETE)
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and greffiers can insert audiences" ON audiences FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GREFFIER'))
);

CREATE POLICY "Admins and greffiers can update audiences" ON audiences FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GREFFIER'))
);

CREATE POLICY "Admins can delete audiences" ON audiences FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 4. RPC Functions that explicitly validate auth.uid()

-- Get all dossiers (non-deleted) with selective columns
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
         d.titre ILIKE '%' || p_search || '%')
    AND (p_status IS NULL OR d.status::TEXT = p_status)
  ORDER BY d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Count dossiers (for pagination)
CREATE OR REPLACE FUNCTION count_dossiers(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dossiers d
  WHERE d.deleted_at IS NULL
    AND (p_search IS NULL OR
         d.numero ILIKE '%' || p_search || '%' OR
         d.titre ILIKE '%' || p_search || '%')
    AND (p_status IS NULL OR d.status::TEXT = p_status);
  RETURN v_count;
END;
$$;

-- Get single dossier by ID
CREATE OR REPLACE FUNCTION get_dossier_by_id(p_id UUID)
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
  WHERE d.id = p_id AND d.deleted_at IS NULL;
END;
$$;

-- Create dossier (validates role)
CREATE OR REPLACE FUNCTION create_dossier(
  p_titre TEXT,
  p_description TEXT,
  p_juridiction TEXT
)
RETURNS TABLE (id UUID, numero TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_new_id UUID;
  v_new_numero TEXT;
BEGIN
  -- Validate authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;

  -- Check role
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER') THEN
    RAISE EXCEPTION 'Accès refusé: rôle insuffisant' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  -- Insert
  INSERT INTO dossiers (titre, description, juridiction, created_by)
  VALUES (p_titre, p_description, p_juridiction, v_user_id)
  RETURNING id, numero INTO v_new_id, v_new_numero;

  -- Audit log
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'CREATE_DOSSIER', 'dossier', v_new_id,
          jsonb_build_object('numero', v_new_numero, 'titre', p_titre, 'juridiction', p_juridiction));

  -- Return
  id := v_new_id;
  numero := v_new_numero;
  RETURN NEXT;
END;
$$;

-- Soft delete dossier
CREATE OR REPLACE FUNCTION soft_delete_dossier(p_id UUID)
RETURNS VOID
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

  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Accès refusé: réservé aux administrateurs' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  UPDATE dossiers SET deleted_at = NOW() WHERE id = p_id AND deleted_at IS NULL;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'DELETE_DOSSIER', 'dossier', p_id, '{"soft_delete": true}');
END;
$$;

-- Update dossier status
CREATE OR REPLACE FUNCTION update_dossier_status(p_id UUID, p_new_status TEXT)
RETURNS VOID
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

  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER', 'JUGE') THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  UPDATE dossiers
  SET status = p_new_status::dossier_status, updated_at = NOW()
  WHERE id = p_id AND deleted_at IS NULL;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'UPDATE_DOSSIER_STATUS', 'dossier', p_id,
          jsonb_build_object('new_status', p_new_status));
END;
$$;

-- Get audiences for a dossier
CREATE OR REPLACE FUNCTION get_audiences_for_dossier(p_dossier_id UUID)
RETURNS TABLE (
  id UUID, dossier_id UUID, juge_id UUID,
  date_heure TIMESTAMPTZ, salle TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  juge_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.dossier_id, a.juge_id, a.date_heure, a.salle,
         a.created_at, a.updated_at,
         COALESCE(p.first_name || ' ' || p.last_name, 'Non assigné') AS juge_name
  FROM audiences a
  LEFT JOIN profiles p ON p.id = a.juge_id
  WHERE a.dossier_id = p_dossier_id
  ORDER BY a.date_heure DESC;
END;
$$;

-- Get all audiences (with dossier info)
CREATE OR REPLACE FUNCTION get_audiences(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, dossier_id UUID, juge_id UUID,
  date_heure TIMESTAMPTZ, salle TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  juge_name TEXT, dossier_numero TEXT, dossier_titre TEXT, dossier_juridiction TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.dossier_id, a.juge_id, a.date_heure, a.salle,
         a.created_at, a.updated_at,
         COALESCE(p.first_name || ' ' || p.last_name, 'Non assigné'),
         d.numero, d.titre, d.juridiction
  FROM audiences a
  LEFT JOIN profiles p ON p.id = a.juge_id
  LEFT JOIN dossiers d ON d.id = a.dossier_id
  ORDER BY a.date_heure ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Get upcoming audiences (next 5)
CREATE OR REPLACE FUNCTION get_upcoming_audiences(p_limit INT DEFAULT 5)
RETURNS TABLE (
  id UUID, dossier_id UUID, date_heure TIMESTAMPTZ, salle TEXT,
  juge_name TEXT, dossier_numero TEXT, dossier_juridiction TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.dossier_id, a.date_heure, a.salle,
         COALESCE(p.first_name || ' ' || p.last_name, 'Non assigné'),
         d.numero, d.juridiction
  FROM audiences a
  LEFT JOIN profiles p ON p.id = a.juge_id
  LEFT JOIN dossiers d ON d.id = a.dossier_id
  WHERE a.date_heure >= NOW()
  ORDER BY a.date_heure ASC
  LIMIT p_limit;
END;
$$;

-- Create audience with conflict detection
CREATE OR REPLACE FUNCTION create_audience(
  p_dossier_id UUID,
  p_juge_id UUID,
  p_date_heure TIMESTAMPTZ,
  p_salle TEXT
)
RETURNS TABLE (id UUID, conflict_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_new_id UUID;
  v_conflict TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié' USING ERRCODE = 'UNAUTHORIZED';
  END IF;

  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER') THEN
    RAISE EXCEPTION 'Accès refusé: rôle insuffisant' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  -- Check salle conflict
  IF EXISTS (
    SELECT 1 FROM audiences
    WHERE salle = p_salle
      AND date_heure = p_date_heure
  ) THEN
    v_conflict := 'La salle ' || p_salle || ' est déjà occupée à ce créneau horaire.';
    id := NULL;
    conflict_message := v_conflict;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check juge conflict
  IF p_juge_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM audiences
    WHERE juge_id = p_juge_id
      AND date_heure = p_date_heure
  ) THEN
    v_conflict := 'Le magistrat est déjà assigné à une autre audience à ce créneau.';
    id := NULL;
    conflict_message := v_conflict;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO audiences (dossier_id, juge_id, date_heure, salle)
  VALUES (p_dossier_id, p_juge_id, p_date_heure, p_salle)
  RETURNING id INTO v_new_id;

  -- Audit
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'CREATE_AUDIENCE', 'audience', v_new_id,
          jsonb_build_object('dossier_id', p_dossier_id, 'salle', p_salle, 'date_heure', p_date_heure));

  id := v_new_id;
  conflict_message := NULL;
  RETURN NEXT;
END;
$$;

-- Cancel/delete audience
CREATE OR REPLACE FUNCTION cancel_audience(p_id UUID)
RETURNS VOID
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

  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role NOT IN ('ADMIN', 'GREFFIER') THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  DELETE FROM audiences WHERE id = p_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, 'CANCEL_AUDIENCE', 'audience', p_id, '{"cancellation": true}');
END;
$$;

-- Get all profiles (admin view)
CREATE OR REPLACE FUNCTION get_all_profiles()
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

  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs' USING ERRCODE = 'INSUFFICIENT_PRIVILEGE';
  END IF;

  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.role, p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  dossiers_count BIGINT,
  audiences_count BIGINT,
  today_audiences_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM dossiers WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM audiences),
    (SELECT COUNT(*) FROM audiences WHERE date_trunc('day', date_heure) = date_trunc('day', NOW()));
END;
$$;

-- Get dossiers list for select dropdowns (id, numero, titre)
CREATE OR REPLACE FUNCTION get_dossiers_select()
RETURNS TABLE (id UUID, numero TEXT, titre TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.numero, d.titre
  FROM dossiers d
  WHERE d.deleted_at IS NULL
  ORDER BY d.created_at DESC;
END;
$$;

-- Get judges list for select dropdowns
CREATE OR REPLACE FUNCTION get_juges_select()
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.first_name || ' ' || p.last_name AS name
  FROM profiles p
  WHERE p.role = 'JUGE'
  ORDER BY p.last_name;
END;
$$;