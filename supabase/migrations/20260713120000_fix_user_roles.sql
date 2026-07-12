-- Fix: ensure pat.epee@gmail.com has ADMIN role
-- This can happen if the user was created before the trigger was in place,
-- or if the trigger failed during signup.

UPDATE profiles
SET role = 'ADMIN'::user_role,
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'pat.epee@gmail.com')
  AND (role IS NULL OR role != 'ADMIN'::user_role);

-- Also ensure all known seed users have the correct role
UPDATE profiles SET role = 'GREFFIER'::user_role, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'greffier@legalyx.cm')
  AND (role IS NULL OR role != 'GREFFIER'::user_role);

UPDATE profiles SET role = 'JUGE'::user_role, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'juge@legalyx.cm')
  AND (role IS NULL OR role != 'JUGE'::user_role);

UPDATE profiles SET role = 'AVOCAT'::user_role, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'avocat@legalyx.cm')
  AND (role IS NULL OR role != 'AVOCAT'::user_role);