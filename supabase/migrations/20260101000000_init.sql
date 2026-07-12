-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE');
CREATE TYPE dossier_status AS ENUM ('OUVERT', 'EN_INSTRUCTION', 'AUDIENCE', 'JUGEMENT', 'ARCHIVE');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role DEFAULT 'PARTIE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Dossiers
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  juridiction TEXT NOT NULL,
  status dossier_status DEFAULT 'OUVERT',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for auto-numbering
CREATE OR REPLACE FUNCTION generate_dossier_numero()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT := to_char(CURRENT_DATE, 'YYYY');
  prefix TEXT := 'CIV';
  seq_val INT;
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    SELECT COUNT(*) INTO seq_val FROM dossiers WHERE to_char(created_at, 'YYYY') = year;
    NEW.numero := year || '-' || prefix || '-' || lpad((seq_val + 1)::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dossier_numero_trigger
BEFORE INSERT ON dossiers
FOR EACH ROW
EXECUTE FUNCTION generate_dossier_numero();

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dossiers" ON dossiers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Greffiers and admins can insert dossiers" ON dossiers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GREFFIER'))
);

-- Audiences
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  juge_id UUID REFERENCES profiles(id),
  date_heure TIMESTAMPTZ NOT NULL,
  salle TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view audiences" ON audiences FOR SELECT USING (auth.role() = 'authenticated');

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Insert only audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Prénom'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nom'),
    CASE
      WHEN NEW.email = 'pat.epee@gmail.com' THEN 'ADMIN'::user_role
      WHEN NEW.email = 'greffier@legalyx.cm' THEN 'GREFFIER'::user_role
      WHEN NEW.email = 'juge@legalyx.cm' THEN 'JUGE'::user_role
      WHEN NEW.email = 'avocat@legalyx.cm' THEN 'AVOCAT'::user_role
      ELSE 'PARTIE'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert seed users
-- Admin (pat.epee@gmail.com)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  '2dfe080b-b00d-4de1-9bf1-178794a15b47',
  'pat.epee@gmail.com',
  crypt('AdminLegalyx2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Pat","last_name":"Epee"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Juge
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  '3a2b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
  'juge@legalyx.cm',
  crypt('JugeLegalyx2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Jean","last_name":"Talla"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Greffier
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  '4a2b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
  'greffier@legalyx.cm',
  crypt('GreffierLegalyx2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Marie","last_name":"Ndongo"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Seed Dossiers
INSERT INTO public.dossiers (id, numero, titre, description, juridiction, status, created_by, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '2026-CIV-001', 'Litige Foncier Mballa', 'Conflit relatif à la délimitation de la parcelle 452 au quartier Bastos, Yaoundé.', 'Civil', 'EN_INSTRUCTION', '2dfe080b-b00d-4de1-9bf1-178794a15b47', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', '2026-COM-042', 'Recouvrement créance SA', 'Recouvrement de factures impayées par la société SOCATRAL SARL.', 'Commercial', 'OUVERT', '2dfe080b-b00d-4de1-9bf1-178794a15b47', now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', '2026-PEN-018', 'Affaire Ministère Public contre N. Jean', 'Poursuites pour abus de confiance et détournement de fonds privés.', 'Pénal', 'AUDIENCE', '2dfe080b-b00d-4de1-9bf1-178794a15b47', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Seed Audiences
INSERT INTO public.audiences (id, dossier_id, juge_id, date_heure, salle)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '3a2b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', now() + interval '1 day', 'Salle d''audience 2'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '3a2b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', now() + interval '2 days', 'Salle d''audience 1')
ON CONFLICT (id) DO NOTHING;

-- Seed Audit Logs
INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
VALUES 
  ('2dfe080b-b00d-4de1-9bf1-178794a15b47', 'CREATE_DOSSIER', 'dossier', '11111111-1111-1111-1111-111111111111', '{"numero": "2026-CIV-001", "titre": "Litige Foncier Mballa"}'),
  ('2dfe080b-b00d-4de1-9bf1-178794a15b47', 'CREATE_DOSSIER', 'dossier', '22222222-2222-2222-2222-222222222222', '{"numero": "2026-COM-042", "titre": "Recouvrement créance SA"}'),
  ('2dfe080b-b00d-4de1-9bf1-178794a15b47', 'CREATE_DOSSIER', 'dossier', '33333333-3333-3333-3333-333333333333', '{"numero": "2026-PEN-018", "titre": "Affaire Ministère Public"}')
ON CONFLICT (id) DO NOTHING;

