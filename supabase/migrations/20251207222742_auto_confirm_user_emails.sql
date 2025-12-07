/*
  # Auto-Confirm User Emails

  ## Overview
  For a game PWA, requiring email confirmation creates unnecessary friction.
  This migration adds auto-confirmation functionality to improve user experience.

  ## Changes
  1. **Function**: `confirm_user_email`
     - Allows programmatic confirmation of user emails
     - Can be called after signup to bypass email verification
  
  2. **Trigger**: `auto_confirm_new_users`
     - Automatically confirms email for all new user signups
     - Runs before insert on auth.users table
  
  ## Security
  - This is appropriate for a game application where email is primarily for account recovery
  - Users can still play without authentication for casual gameplay
*/

-- Create function to confirm user email
CREATE OR REPLACE FUNCTION confirm_user_email(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id
  AND email_confirmed_at IS NULL;
END;
$$;

-- Create trigger function to auto-confirm new users
CREATE OR REPLACE FUNCTION auto_confirm_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_confirm_email ON auth.users;

CREATE TRIGGER on_auth_user_created_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user_email();
