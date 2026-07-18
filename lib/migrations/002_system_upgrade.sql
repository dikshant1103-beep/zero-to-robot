-- Daily Quest, proof-of-work, leaderboard, stat points, shadows.
-- Idempotent: safe to re-run against the live database.

-- ---- Daily Quest + streak ----
ALTER TABLE players ADD COLUMN IF NOT EXISTS daily_target int NOT NULL DEFAULT 60;
ALTER TABLE players ADD COLUMN IF NOT EXISTS streak int NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS best_streak int NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_cleared date;

-- One row per player per day. Written by syncProgress() as XP is earned.
CREATE TABLE IF NOT EXISTS daily_activity (
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  xp int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- ---- Proof of work ----
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS proof_url text;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS proof_verified boolean NOT NULL DEFAULT false;

-- ---- Leaderboard (opt-in only) ----
ALTER TABLE players ADD COLUMN IF NOT EXISTS public_name text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS on_leaderboard boolean NOT NULL DEFAULT false;
-- Cached so the leaderboard is one query instead of recomputing every player.
ALTER TABLE players ADD COLUMN IF NOT EXISTS cached_xp int NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS cached_level int NOT NULL DEFAULT 1;

-- ---- Stat allocation ----
ALTER TABLE players ADD COLUMN IF NOT EXISTS alloc jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ---- Shadow army ----
CREATE TABLE IF NOT EXISTS shadows (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  url text,
  phase_position int,
  extracted date NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS shadows_user ON shadows(user_id);

CREATE INDEX IF NOT EXISTS players_leaderboard ON players(on_leaderboard, cached_xp DESC);
