import roadmap from "@/data/roadmap.json";
import books from "@/data/books.json";
import courses from "@/data/courses.json";

// XP sources: milestone = 150 XP, course = hours×10 XP scaled by progress,
// book chapter = 30 XP. Level = 300 XP each (linear). Full plan ≈ level 50.
const XP_PER_MILESTONE = 150;
const XP_PER_CHAPTER = 30;
const XP_PER_LEVEL = 300;

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

export function getSystem() {
  const areaXP = {};
  let xp = 0;

  for (const c of courses.courses) {
    const g = Math.round((c.hours * 10 * c.progress) / 100);
    xp += g;
    areaXP[c.area] = (areaXP[c.area] || 0) + g;
  }
  for (const b of books.books) {
    const g = b.chaptersRead * XP_PER_CHAPTER;
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

  const stats = STATS.map((s) => ({
    ...s,
    value: 10 + Math.floor(s.areas.reduce((a, ar) => a + (areaXP[ar] || 0), 0) / 150),
  }));

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
    activePhase,
  };
}
