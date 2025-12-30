-- Function to assign orphan notes/tags to the first user who signs up
CREATE OR REPLACE FUNCTION assign_orphan_data_to_first_user()
RETURNS TRIGGER AS $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Count orphan notes (notes without user_id)
  SELECT COUNT(*) INTO orphan_count FROM public.notes WHERE user_id IS NULL;

  -- If there are orphan notes, assign them to this user
  IF orphan_count > 0 THEN
    -- Assign all orphan notes to this user
    UPDATE public.notes SET user_id = NEW.id WHERE user_id IS NULL;

    -- Assign all orphan tags to this user
    UPDATE public.tags SET user_id = NEW.id WHERE user_id IS NULL;

    RAISE NOTICE 'Assigned % orphan notes and related tags to user %', orphan_count, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_first_user_created ON auth.users;
CREATE TRIGGER on_first_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_orphan_data_to_first_user();
