// XP sources: milestone = 150 XP, course = hours×10 XP scaled by progress,
// book chapter = 30 XP. Level = 300 XP each (linear). Full plan ≈ level 50.
const XP_PER_MILESTONE = 150;
const XP_PER_CHAPTER = 30;
const XP_PER_LEVEL = 300;

// A tome you own is "bound": chapters absorbed from it are worth more. The
// bonus rides on reading, never on acquiring — owning a book you never open
// is worth exactly nothing.
const BOUND_MULTIPLIER = 1.25;

export function chapterXP(book) {
  return Math.round(book.chaptersRead * XP_PER_CHAPTER * (book.owned ? BOUND_MULTIPLIER : 1));
}

const STATS = [
  { key: "STR", label: "Hardware", areas: ["Electronics", "Embedded"] },
  { key: "INT", label: "Code & ML", areas: ["CS", "ML"] },
  { key: "AGI", label: "Flight", areas: ["Drone", "Control"] },
  { key: "VIT", label: "Robotics Core", areas: ["Robotics"] },
  { key: "PER", label: "Humanoid", areas: ["Humanoid"] },
];

const TITLES = [
  [1, "The One Who Starts From Zero"],
  [8, "Apprentice of the Forge"],
  [16, "Circuit Walker"],
  [24, "Simulation Sovereign"],
  [32, "Trainer of Machines"],
  [40, "Pilot of the Iron Wing"],
  [46, "Monarch of Machines"],
];

export function rankForLevel(level) {
  return level >= 46 ? "S" : level >= 38 ? "A" : level >= 30 ? "B" : level >= 20 ? "C" : level >= 10 ? "D" : "E";
}

export const GATE_RANKS = ["E", "D", "C", "B", "A", "S"];

export function gateRank(position) {
  return GATE_RANKS[Math.min(position, GATE_RANKS.length - 1)];
}

export function getSystem({ roadmap, courses, books, player }) {
  const areaXP = {};
  let xp = 0;

  for (const c of courses.courses) {
    const g = Math.round((c.hours * 10 * c.progress) / 100);
    xp += g;
    areaXP[c.area] = (areaXP[c.area] || 0) + g;
  }
  for (const b of books.books) {
    const g = chapterXP(b);
    xp += g;
    areaXP[b.area] = (areaXP[b.area] || 0) + g;
  }

  const allMs = roadmap.phases.flatMap((p) => p.milestones);
  const msDone = allMs.filter((m) => m.done).length;
  xp += msDone * XP_PER_MILESTONE;

  const level = 1 + Math.floor(xp / XP_PER_LEVEL);
  const intoLevel = xp % XP_PER_LEVEL;
  const rank = rankForLevel(level);
  const title = TITLES.filter(([lv]) => level >= lv).at(-1)[1];

  // Earned from study, plus any free points the player allocated on level-up.
  const alloc = player?.alloc || {};
  const stats = STATS.map((s) => ({
    ...s,
    base: 10 + Math.floor(s.areas.reduce((a, ar) => a + (areaXP[ar] || 0), 0) / 150),
    allocated: alloc[s.key] || 0,
    value:
      10 +
      Math.floor(s.areas.reduce((a, ar) => a + (areaXP[ar] || 0), 0) / 150) +
      (alloc[s.key] || 0),
  }));

  // One free point per level gained past level 1.
  const spent = STATS.reduce((a, s) => a + (alloc[s.key] || 0), 0);

  const cs = courses.courses;
  const activePhase = roadmap.phases.find((p) => p.status === "active") || roadmap.phases[0];

  return {
    xp,
    level,
    intoLevel,
    xpPerLevel: XP_PER_LEVEL,
    rank,
    title,
    stats,
    milestones: { done: msDone, total: allMs.length },
    courses: {
      done: cs.filter((c) => c.progress >= 100).length,
      total: cs.length,
      avg: cs.length ? Math.round(cs.reduce((a, c) => a + c.progress, 0) / cs.length) : 0,
    },
    books: {
      read: books.books.reduce((a, b) => a + b.chaptersRead, 0),
      total: books.books.reduce((a, b) => a + b.chaptersTotal, 0),
    },
    artifacts: {
      bound: books.books.filter((b) => b.owned).length,
      total: books.books.length,
    },
    activePhase,
    points: { earned: Math.max(0, 1 + Math.floor(xp / XP_PER_LEVEL) - 1), spent, free: Math.max(0, Math.floor(xp / XP_PER_LEVEL) - spent) },
  };
}
