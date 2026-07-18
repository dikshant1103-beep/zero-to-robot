"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { syncProgress } from "./progress";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

// Recompute XP (which advances the Daily Quest and the leaderboard cache),
// then revalidate. Every mutation funnels through here.
async function refresh(userId) {
  if (userId) await syncProgress(userId);
  revalidatePath("/me", "layout");
}

const clampInt = (v, min, max, fallback = min) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
};

// Only allow web links — blocks javascript:/data: schemes in user-supplied URLs.
const safeUrl = (v) => {
  const s = String(v || "").trim().slice(0, 500);
  return /^https?:\/\//i.test(s) ? s : "";
};

// Per-user row caps so one account can't flood the free-tier database.
const CAPS = { phases: 30, milestonesPerPhase: 100, courses: 300, books: 300, log_entries: 2000 };

// ---- quests (milestones) ----

export async function toggleMilestone(id) {
  const userId = await requireUser();
  await sql`
    UPDATE milestones m SET done = NOT m.done
    FROM phases p WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  await refresh(userId);
}

export async function updateMilestone(id, text) {
  const userId = await requireUser();
  const t = String(text || "").trim().slice(0, 500);
  if (!t) return;
  await sql`
    UPDATE milestones m SET text = ${t}
    FROM phases p WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  await refresh(userId);
}

export async function addMilestone(phaseId, text) {
  const userId = await requireUser();
  const t = String(text || "").trim().slice(0, 500);
  if (!t) return;
  await sql`
    INSERT INTO milestones (phase_id, position, text)
    SELECT p.id, COALESCE((SELECT MAX(position) + 1 FROM milestones WHERE phase_id = p.id), 0), ${t}
    FROM phases p WHERE p.id = ${phaseId} AND p.user_id = ${userId}
      AND (SELECT COUNT(*) FROM milestones WHERE phase_id = p.id) < ${CAPS.milestonesPerPhase}
  `;
  await refresh(userId);
}

export async function deleteMilestone(id) {
  const userId = await requireUser();
  await sql`
    DELETE FROM milestones m USING phases p
    WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  await refresh(userId);
}

// ---- gates (phases) ----

export async function addPhase({ name, window: windowLabel, goal }) {
  const userId = await requireUser();
  const n = String(name || "").trim().slice(0, 120);
  if (!n) return;
  await sql`
    INSERT INTO phases (user_id, position, name, window_label, goal)
    SELECT
      ${userId},
      COALESCE((SELECT MAX(position) + 1 FROM phases WHERE user_id = ${userId}), 0),
      ${n}, ${String(windowLabel || "").slice(0, 120)}, ${String(goal || "").slice(0, 1000)}
    WHERE (SELECT COUNT(*) FROM phases WHERE user_id = ${userId}) < ${CAPS.phases}
  `;
  await refresh(userId);
}

export async function updatePhase(id, { name, window: windowLabel, goal, status }) {
  const userId = await requireUser();
  const n = String(name || "").trim().slice(0, 120);
  if (!n) return;
  const st = ["active", "done", "upcoming"].includes(status) ? status : "upcoming";
  await sql`
    UPDATE phases SET
      name = ${n},
      window_label = ${String(windowLabel || "").slice(0, 120)},
      goal = ${String(goal || "").slice(0, 1000)},
      status = ${st}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function deletePhase(id) {
  const userId = await requireUser();
  await sql`DELETE FROM phases WHERE id = ${id} AND user_id = ${userId}`;
  await refresh(userId);
}

// ---- skills (courses) ----

export async function setCourseProgress(id, progress) {
  const userId = await requireUser();
  const p = clampInt(progress, 0, 100, 0);
  const status = p >= 100 ? "done" : p > 0 ? "in-progress" : "not-started";
  await sql`
    UPDATE courses SET progress = ${p}, status = ${status}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function addCourse(f) {
  const userId = await requireUser();
  const title = String(f.title || "").trim().slice(0, 200);
  if (!title) return;
  await sql`
    INSERT INTO courses (user_id, position, phase, title, instructor, platform, area, hours, url)
    SELECT
      ${userId},
      COALESCE((SELECT MAX(position) + 1 FROM courses WHERE user_id = ${userId}), 0),
      ${clampInt(f.phase, 0, 20, 1)}, ${title},
      ${String(f.instructor || "").slice(0, 120)},
      ${["udemy", "nptel", "free"].includes(f.platform) ? f.platform : "free"},
      ${String(f.area || "CS").slice(0, 40)},
      ${clampInt(f.hours, 1, 500, 10)}, ${safeUrl(f.url)}
    WHERE (SELECT COUNT(*) FROM courses WHERE user_id = ${userId}) < ${CAPS.courses}
  `;
  await refresh(userId);
}

export async function updateCourse(id, f) {
  const userId = await requireUser();
  const title = String(f.title || "").trim().slice(0, 200);
  if (!title) return;
  await sql`
    UPDATE courses SET
      title = ${title},
      instructor = ${String(f.instructor || "").slice(0, 120)},
      url = ${safeUrl(f.url)},
      platform = ${["udemy", "nptel", "free"].includes(f.platform) ? f.platform : "free"},
      area = ${String(f.area || "CS").slice(0, 40)},
      hours = ${clampInt(f.hours, 1, 500, 10)},
      phase = ${clampInt(f.phase, 0, 20, 1)}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function deleteCourse(id) {
  const userId = await requireUser();
  await sql`DELETE FROM courses WHERE id = ${id} AND user_id = ${userId}`;
  await refresh(userId);
}

// ---- tomes (books) ----

export async function setChaptersRead(id, n) {
  const userId = await requireUser();
  const v = clampInt(n, 0, 99, 0);
  await sql`
    UPDATE books SET chapters_read = LEAST(${v}, chapters_total)
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

// Bind or unbind a tome — a bound (owned) tome pays 25% more XP per chapter.
export async function setBookOwned(id, owned) {
  const userId = await requireUser();
  await sql`
    UPDATE books SET owned = ${!!owned}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function addBook(f) {
  const userId = await requireUser();
  const title = String(f.title || "").trim().slice(0, 200);
  if (!title) return;
  await sql`
    INSERT INTO books (user_id, position, title, authors, area, phase, priority, free_url, chapters_total, why)
    SELECT
      ${userId},
      COALESCE((SELECT MAX(position) + 1 FROM books WHERE user_id = ${userId}), 0),
      ${title},
      ${String(f.authors || "").slice(0, 200)},
      ${String(f.area || "CS").slice(0, 40)},
      ${String(f.phase || "1").slice(0, 20)},
      ${f.priority === "reference" ? "reference" : "core"},
      ${safeUrl(f.free) || null},
      ${clampInt(f.chaptersTotal, 1, 99, 10)},
      ${String(f.why || "").slice(0, 1000)}
    WHERE (SELECT COUNT(*) FROM books WHERE user_id = ${userId}) < ${CAPS.books}
  `;
  await refresh(userId);
}

export async function updateBook(id, f) {
  const userId = await requireUser();
  const title = String(f.title || "").trim().slice(0, 200);
  if (!title) return;
  await sql`
    UPDATE books SET
      title = ${title},
      authors = ${String(f.authors || "").slice(0, 200)},
      area = ${String(f.area || "CS").slice(0, 40)},
      phase = ${String(f.phase || "1").slice(0, 20)},
      priority = ${f.priority === "reference" ? "reference" : "core"},
      free_url = ${safeUrl(f.free) || null},
      chapters_total = ${clampInt(f.chaptersTotal, 1, 99, 10)},
      chapters_read = LEAST(chapters_read, ${clampInt(f.chaptersTotal, 1, 99, 10)}),
      why = ${String(f.why || "").slice(0, 1000)}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function deleteBook(id) {
  const userId = await requireUser();
  await sql`DELETE FROM books WHERE id = ${id} AND user_id = ${userId}`;
  await refresh(userId);
}

// ---- raid log ----

export async function addLogEntry(f) {
  const userId = await requireUser();
  const title = String(f.title || "").trim().slice(0, 200);
  if (!title) return;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(f.date) ? f.date : new Date().toISOString().slice(0, 10);
  await sql`
    INSERT INTO log_entries (user_id, entry_date, phase, title, body)
    SELECT ${userId}, ${date}, ${clampInt(f.phase, 0, 20, 0)}, ${title}, ${String(f.body || "").slice(0, 5000)}
    WHERE (SELECT COUNT(*) FROM log_entries WHERE user_id = ${userId}) < ${CAPS.log_entries}
  `;
  await refresh(userId);
}

export async function deleteLogEntry(id) {
  const userId = await requireUser();
  await sql`DELETE FROM log_entries WHERE id = ${id} AND user_id = ${userId}`;
  await refresh(userId);
}

// ---- daily quest ----

export async function setDailyTarget(target) {
  const userId = await requireUser();
  await sql`
    UPDATE players SET daily_target = ${clampInt(target, 30, 600, 60)}
    WHERE user_id = ${userId}
  `;
  await refresh(userId);
}

// ---- proof of work ----

// A quest backed by a real artifact reads as VERIFIED. We check the link
// actually resolves rather than trusting the paste — an unreachable URL is
// still saved, just not marked verified.
export async function setMilestoneProof(id, url) {
  const userId = await requireUser();
  const clean = safeUrl(url);
  let verified = false;
  if (clean) {
    try {
      const host = new URL(clean).hostname.replace(/^www\./, "");
      if (host === "github.com" || host === "gitlab.com") {
        const res = await fetch(clean, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(6000),
        });
        verified = res.ok;
      }
    } catch {
      verified = false; // unreachable, timed out, or malformed — save unverified
    }
  }
  await sql`
    UPDATE milestones m SET proof_url = ${clean || null}, proof_verified = ${verified}
    FROM phases p WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  await refresh(userId);
}

// ---- leaderboard (opt-in) ----

export async function setLeaderboard({ optIn, publicName }) {
  const userId = await requireUser();
  // Display name is chosen by the player — never their email or Clerk profile.
  const name = String(publicName || "").trim().slice(0, 24).replace(/[<>]/g, "");
  await sql`
    UPDATE players
       SET on_leaderboard = ${!!optIn && !!name},
           public_name = ${name || null}
     WHERE user_id = ${userId}
  `;
  await refresh(userId);
  revalidatePath("/leaderboard");
}

// ---- stat allocation ----

const STAT_KEYS = ["STR", "INT", "AGI", "VIT", "PER"];

export async function allocPoint(stat) {
  const userId = await requireUser();
  if (!STAT_KEYS.includes(stat)) return;
  const [p] = await sql`SELECT cached_level, alloc FROM players WHERE user_id = ${userId}`;
  if (!p) return;
  const alloc = p.alloc || {};
  const spent = STAT_KEYS.reduce((a, k) => a + (alloc[k] || 0), 0);
  // One point per level gained after level 1.
  if (spent >= p.cached_level - 1) return;
  alloc[stat] = (alloc[stat] || 0) + 1;
  await sql`UPDATE players SET alloc = ${JSON.stringify(alloc)}::jsonb WHERE user_id = ${userId}`;
  await refresh(userId);
}

export async function resetPoints() {
  const userId = await requireUser();
  await sql`UPDATE players SET alloc = '{}'::jsonb WHERE user_id = ${userId}`;
  await refresh(userId);
}

// ---- shadow army ----

// A gate can only be extracted once every quest inside it is cleared.
export async function extractShadow(phaseId) {
  const userId = await requireUser();
  const [phase] = await sql`
    SELECT p.id, p.name, p.position,
           (SELECT COUNT(*) FROM milestones WHERE phase_id = p.id)::int AS total,
           (SELECT COUNT(*) FROM milestones WHERE phase_id = p.id AND done)::int AS done
      FROM phases p WHERE p.id = ${phaseId} AND p.user_id = ${userId}
  `;
  if (!phase || phase.total === 0 || phase.done < phase.total) return;
  await sql`
    INSERT INTO shadows (user_id, name, role, phase_position)
    SELECT ${userId}, ${phase.name}, 'Cleared Gate', ${phase.position}
    WHERE NOT EXISTS (
      SELECT 1 FROM shadows WHERE user_id = ${userId} AND phase_position = ${phase.position}
    )
  `;
  await refresh(userId);
}

export async function nameShadow(id, name, url) {
  const userId = await requireUser();
  const n = String(name || "").trim().slice(0, 80);
  if (!n) return;
  await sql`
    UPDATE shadows SET name = ${n}, url = ${safeUrl(url) || null}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  await refresh(userId);
}

export async function dismissShadow(id) {
  const userId = await requireUser();
  await sql`DELETE FROM shadows WHERE id = ${id} AND user_id = ${userId}`;
  await refresh(userId);
}
