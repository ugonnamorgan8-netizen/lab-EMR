DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'LAB_SCIENTIST'
  ) THEN
    UPDATE "User"
    SET role = 'LAB_SCIENTIST'
    WHERE role::text IN ('PHLEBOTOMIST', 'LAB_TECHNICIAN', 'QC_OFFICER', 'DISPATCH_OFFICER');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'ADMIN'
  ) AND EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'LAB_MANAGER'
  ) THEN
    UPDATE "User"
    SET role = 'ADMIN'
    WHERE role::text = 'LAB_MANAGER';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'ACCOUNTANT'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'ACCOUNTS'
  ) THEN
    ALTER TYPE "Role" RENAME VALUE 'ACCOUNTANT' TO 'ACCOUNTS';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'ADMIN'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'Role' AND enum_value.enumlabel = 'SUPERVISOR'
  ) THEN
    ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'SUPERVISOR';
  END IF;
END $$;
