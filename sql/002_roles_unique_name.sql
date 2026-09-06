-- Dedupe existing role rows (keep the earliest per name), reassigning any
-- sessions that reference a duplicate over to the kept row first. Then add
-- a unique constraint on name so the previously-silent double-seed bug
-- (ON CONFLICT DO NOTHING with no constraint to conflict on) can't recur.
WITH ranked AS (
  SELECT id, name, row_number() OVER (PARTITION BY name ORDER BY created_at) AS rn
  FROM roles
),
keepers AS (
  SELECT r1.id AS dup_id, r2.id AS keep_id
  FROM ranked r1
  JOIN ranked r2 ON r1.name = r2.name AND r2.rn = 1
  WHERE r1.rn > 1
)
UPDATE sessions
SET role_id = keepers.keep_id
FROM keepers
WHERE sessions.role_id = keepers.dup_id;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY name ORDER BY created_at) AS rn
  FROM roles
)
DELETE FROM roles WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_unique'
  ) THEN
    ALTER TABLE roles ADD CONSTRAINT roles_name_unique UNIQUE (name);
  END IF;
END $$;
