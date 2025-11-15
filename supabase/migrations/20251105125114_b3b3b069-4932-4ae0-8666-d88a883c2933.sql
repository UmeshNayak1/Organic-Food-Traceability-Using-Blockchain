-- Add distributor role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'distributor';