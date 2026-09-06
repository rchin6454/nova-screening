CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role_family TEXT NOT NULL CHECK (role_family IN ('engineering', 'frontline')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id        UUID NOT NULL REFERENCES roles(id),
  candidate_name TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'awaiting_consent'
                 CHECK (status IN ('awaiting_consent', 'active', 'completed', 'abandoned', 'consent_refused')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  role       TEXT NOT NULL CHECK (role IN ('assistant', 'user')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES sessions(id),
  version               INTEGER NOT NULL DEFAULT 1,
  score                 TEXT CHECK (score IN ('high', 'medium', 'low')),
  rationale             TEXT,
  dimensions            JSONB,
  blocking_constraints  JSONB DEFAULT '[]'::jsonb,
  time_sensitive_flags  JSONB DEFAULT '[]'::jsonb,
  insufficient_evidence BOOLEAN NOT NULL DEFAULT false,
  unasked_areas         JSONB DEFAULT '[]'::jsonb,
  error_state           BOOLEAN NOT NULL DEFAULT false,
  raw_response          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'session_started', 'consent_given', 'consent_refused',
    'message_sent', 'session_ended', 'score_generated',
    'insufficient_evidence_flagged', 'blocking_constraint_detected'
  )),
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_role_id ON sessions(role_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_session_id ON scores(session_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
