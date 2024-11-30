-- Function to create initial admin user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id != NEW.id
  ) THEN
    -- First user gets admin role
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    WHERE id = NEW.id;

    -- Also create user record
    INSERT INTO public.users (
      id,
      email,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      'admin'
    );
  ELSE
    -- Subsequent users get visitor role by default
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"visitor"'
    )
    WHERE id = NEW.id;

    -- Create user record
    INSERT INTO public.users (
      id,
      email,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      'sales'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to ensure admin exists
CREATE OR REPLACE FUNCTION ensure_admin_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to demote the last admin
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    -- Check if there would be any admins left
    IF NOT EXISTS (
      SELECT 1 FROM users
      WHERE role = 'admin' AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot demote the last admin user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure at least one admin exists
CREATE TRIGGER ensure_admin_exists_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_admin_exists();

-- Add comments
COMMENT ON FUNCTION handle_new_user() IS 'Automatically assigns admin role to first user and visitor role to subsequent users';
COMMENT ON FUNCTION ensure_admin_exists() IS 'Prevents demotion of the last admin user';