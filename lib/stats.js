import roadmap from "@/data/roadmap.json";
import books from "@/data/books.json";
import courses from "@/data/courses.json";

export function getStats() {
  const allMilestones = roadmap.phases.flatMap((p) => p.milestones);
  const msDone = allMilestones.filter((m) => m.done).length;

  const cs = courses.courses;
  const courseAvg =
    cs.length === 0 ? 0 : Math.round(cs.reduce((a, c) => a + c.progress, 0) / cs.length);
  const coursesDone = cs.filter((c) => c.progress >= 100).length;

  const core = books.books.filter((b) => b.priority === "core");
  const chTotal = core.reduce((a, b) => a + b.chaptersTotal, 0);
  const chRead = core.reduce((a, b) => a + b.chaptersRead, 0);

  const activePhase =
    roadmap.phases.find((p) => p.status === "active") || roadmap.phases[0];

  return {
    milestones: { done: msDone, total: allMilestones.length },
    courses: { avg: courseAvg, done: coursesDone, total: cs.length },
    books: { read: chRead, total: chTotal, core: core.length },
    overall: Math.round((msDone / allMilestones.length) * 100),
    activePhase,
  };
}
