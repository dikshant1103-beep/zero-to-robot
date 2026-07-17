"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sql } from "./db";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

function refresh() {
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
  refresh();
}

export async function updateMilestone(id, text) {
  const userId = await requireUser();
  const t = String(text || "").trim().slice(0, 500);
  if (!t) return;
  await sql`
    UPDATE milestones m SET text = ${t}
    FROM phases p WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  refresh();
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
  refresh();
}

export async function deleteMilestone(id) {
  const userId = await requireUser();
  await sql`
    DELETE FROM milestones m USING phases p
    WHERE m.id = ${id} AND p.id = m.phase_id AND p.user_id = ${userId}
  `;
  refresh();
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
  refresh();
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
  refresh();
}

export async function deletePhase(id) {
  const userId = await requireUser();
  await sql`DELETE FROM phases WHERE id = ${id} AND user_id = ${userId}`;
  refresh();
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
  refresh();
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
  refresh();
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
  refresh();
}

export async function deleteCourse(id) {
  const userId = await requireUser();
  await sql`DELETE FROM courses WHERE id = ${id} AND user_id = ${userId}`;
  refresh();
}

// ---- tomes (books) ----

export async function setChaptersRead(id, n) {
  const userId = await requireUser();
  const v = clampInt(n, 0, 99, 0);
  await sql`
    UPDATE books SET chapters_read = LEAST(${v}, chapters_total)
    WHERE id = ${id} AND user_id = ${userId}
  `;
  refresh();
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
  refresh();
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
  refresh();
}

export async function deleteBook(id) {
  const userId = await requireUser();
  await sql`DELETE FROM books WHERE id = ${id} AND user_id = ${userId}`;
  refresh();
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
  refresh();
}

export async function deleteLogEntry(id) {
  const userId = await requireUser();
  await sql`DELETE FROM log_entries WHERE id = ${id} AND user_id = ${userId}`;
  refresh();
}
