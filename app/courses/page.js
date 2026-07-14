import courses from "@/data/courses.json";
import { Bar, AreaChip, PlatformBadge } from "@/components/ui";

export const metadata = { title: "Courses · Zero → Robot" };

const PHASES = [1, 2, 3, 4];

export default function Courses() {
  return (
    <>
      <div className="page-head">
        <h1>Courses hub</h1>
        <p>
          Udemy (subscription) + NPTEL + the best free material, ordered by phase.{" "}
          {courses.note}
        </p>
      </div>
      {PHASES.map((ph) => {
        const list = courses.courses.filter((c) => c.phase === ph);
        if (list.length === 0) return null;
        return (
          <section key={ph}>
            <div className="section-label">Phase {ph}</div>
            <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {list.map((c) => (
                <div className="row" key={c.title}>
                  <div>
                    <div className="title">
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.title} ↗
                      </a>
                    </div>
                    <div className="sub">
                      {c.instructor} · ~{c.hours} hrs
                    </div>
                  </div>
                  <div className="meta">
                    <AreaChip area={c.area} />
                    <PlatformBadge platform={c.platform} />
                  </div>
                  <div className="barwrap">
                    <Bar value={c.progress} />
                    <span className="pct">{c.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
