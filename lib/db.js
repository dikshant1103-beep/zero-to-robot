import { neon } from "@neondatabase/serverless";
import seedRoadmap from "@/data/roadmap.json";
import seedCourses from "@/data/courses.json";
import seedBooks from "@/data/books.json";

// Lazy so importing this module never throws at build time when DATABASE_URL
// is absent (the public static pages pull it in through the shared views).
let _sql;
export function sql(strings, ...values) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql(strings, ...values);
}

export async function seedPlayer(userId, name) {
  // ON CONFLICT guards against a double-seed from two parallel first requests.
  const inserted = await sql`
    INSERT INTO players (user_id, name) VALUES (${userId}, ${name})
    ON CONFLICT (user_id) DO NOTHING RETURNING user_id
  `;
  if (inserted.length === 0) return;

  const phaseRows = await Promise.all(
    seedRoadmap.phases.map(
      (p) => sql`
        INSERT INTO phases (user_id, position, name, window_label, status, goal)
        VALUES (${userId}, ${p.id}, ${p.name}, ${p.window}, ${p.status}, ${p.goal})
        RETURNING id
      `
    )
  );
  await Promise.all([
    ...seedRoadmap.phases.flatMap((p, pi) =>
      p.milestones.map(
        (m, i) => sql`
          INSERT INTO milestones (phase_id, position, text, done)
          VALUES (${phaseRows[pi][0].id}, ${i}, ${m.text}, false)
        `
      )
    ),
    ...seedCourses.courses.map(
      (c, i) => sql`
        INSERT INTO courses (user_id, position, phase, title, instructor, platform, area, hours, url, progress, status)
        VALUES (${userId}, ${i}, ${c.phase}, ${c.title}, ${c.instructor}, ${c.platform}, ${c.area}, ${c.hours}, ${c.url}, 0, 'not-started')
      `
    ),
    ...seedBooks.books.map(
      (b, i) => sql`
        INSERT INTO books (user_id, position, title, authors, area, phase, priority, free_url, chapters_total, chapters_read, owned, why)
        VALUES (${userId}, ${i}, ${b.title}, ${b.authors}, ${b.area}, ${String(b.phase)}, ${b.priority}, ${b.free}, ${b.chaptersTotal}, 0, ${!!b.owned}, ${b.why})
      `
    ),
    sql`
      INSERT INTO log_entries (user_id, phase, title, body)
      VALUES (${userId}, 0,
        'Day 0 — You have been chosen as a Player',
        'The System has granted you the Zero → Robot curriculum: 6 gates, ~15 months, from mechanical engineer to someone who can design a robot from scratch, train it, and deploy it. Edit any gate, quest, skill, or tome — this roadmap is yours now. Every quest cleared grants XP. The System is watching.')
    `,
  ]);
}

export async function getPlayerData(userId) {
  const [players, phaseRows, msRows, courseRows, bookRows, logRows] = await Promise.all([
    sql`SELECT user_id, name, job, awakened::text FROM players WHERE user_id = ${userId}`,
    sql`SELECT id, position, name, window_label, status, goal FROM phases WHERE user_id = ${userId} ORDER BY position`,
    sql`SELECT m.id, m.phase_id, m.position, m.text, m.done FROM milestones m
        JOIN phases p ON p.id = m.phase_id WHERE p.user_id = ${userId} ORDER BY m.position, m.id`,
    sql`SELECT * FROM courses WHERE user_id = ${userId} ORDER BY phase, position, id`,
    sql`SELECT * FROM books WHERE user_id = ${userId} ORDER BY position, id`,
    sql`SELECT id, entry_date::text AS date, phase, title, body FROM log_entries
        WHERE user_id = ${userId} ORDER BY entry_date DESC, id DESC`,
  ]);
  if (players.length === 0) return null;

  const phases = phaseRows.map((p) => ({
    dbId: p.id,
    id: p.position,
    name: p.name,
    window: p.window_label,
    status: p.status,
    goal: p.goal,
    milestones: msRows
      .filter((m) => m.phase_id === p.id)
      .map((m) => ({ dbId: m.id, text: m.text, done: m.done })),
  }));

  return {
    player: players[0],
    roadmap: { phases },
    courses: {
      courses: courseRows.map((c) => ({
        dbId: c.id,
        phase: c.phase,
        title: c.title,
        instructor: c.instructor,
        platform: c.platform,
        area: c.area,
        hours: c.hours,
        url: c.url,
        progress: c.progress,
        status: c.status,
      })),
    },
    books: {
      books: bookRows.map((b) => ({
        dbId: b.id,
        title: b.title,
        authors: b.authors,
        area: b.area,
        phase: b.phase,
        priority: b.priority,
        free: b.free_url,
        chaptersTotal: b.chapters_total,
        chaptersRead: b.chapters_read,
        owned: b.owned,
        why: b.why,
      })),
    },
    log: {
      entries: logRows.map((e) => ({
        dbId: e.id,
        date: e.date,
        phase: e.phase,
        title: e.title,
        body: e.body,
      })),
    },
  };
}

export async function ensurePlayerData(userId, name) {
  let data = await getPlayerData(userId);
  if (!data) {
    await seedPlayer(userId, name);
    data = await getPlayerData(userId);
  }
  return data;
}
