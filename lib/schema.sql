-- Zero → Robot multi-user schema. Run once against the Neon database.

CREATE TABLE IF NOT EXISTS players (
  user_id text PRIMARY KEY,
  name text NOT NULL,
  job text NOT NULL DEFAULT 'Hunter → Full-Stack Robotics Engineer',
  awakened date NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS phases (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  position int NOT NULL,
  name text NOT NULL,
  window_label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'upcoming',
  goal text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS phases_user ON phases(user_id);

CREATE TABLE IF NOT EXISTS milestones (
  id serial PRIMARY KEY,
  phase_id int NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  position int NOT NULL,
  text text NOT NULL,
  done boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS milestones_phase ON milestones(phase_id);

CREATE TABLE IF NOT EXISTS courses (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  phase int NOT NULL DEFAULT 1,
  title text NOT NULL,
  instructor text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'free',
  area text NOT NULL DEFAULT 'CS',
  hours int NOT NULL DEFAULT 0,
  url text NOT NULL DEFAULT '',
  progress int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not-started'
);
CREATE INDEX IF NOT EXISTS courses_user ON courses(user_id);

CREATE TABLE IF NOT EXISTS books (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  title text NOT NULL,
  authors text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT 'CS',
  phase text NOT NULL DEFAULT '1',
  priority text NOT NULL DEFAULT 'core',
  free_url text,
  chapters_total int NOT NULL DEFAULT 1,
  chapters_read int NOT NULL DEFAULT 0,
  owned boolean NOT NULL DEFAULT false,
  why text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS books_user ON books(user_id);

CREATE TABLE IF NOT EXISTS log_entries (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  phase int NOT NULL DEFAULT 0,
  title text NOT NULL,
  body text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS log_user ON log_entries(user_id);
