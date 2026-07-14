import courses from "@/data/courses.json";
import { Bar, AreaChip, PlatformBadge, Window } from "@/components/ui";

export const metadata = { title: "TRAINING · Zero → Robot" };

const PHASES = [1, 2, 3, 4];

export default function Training() {
  return (
    <>
      <div className="page-head">
        <h1>
          SKILL <span className="accent">TRAINING</span>
        </h1>
        <p>
          Every skill grants XP as mastery rises — Udemy (subscription) + NPTEL
          + the best free material, grouped by the gate that needs them. Udemy
          links are search links; after enrolling, swap in your exact course URL
          so one click opens the player.
        </p>
      </div>
      {PHASES.map((ph) => {
        const list = courses.courses.filter((c) => c.phase === ph);
        if (list.length === 0) return null;
        return (
          <section key={ph}>
            <div className="section-label">
              REQUIRED FOR <b>GATE {String(ph).padStart(2, "0")}</b>
            </div>
            <Window style={{ paddingTop: 8, paddingBottom: 8 }}>
              {list.map((c) => (
                <div className="row" key={c.title}>
                  <div>
                    <div className="title">
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.title} ↗
                      </a>
                    </div>
                    <div className="sub">
                      {c.instructor} · ~{c.hours} hrs · +{c.hours * 10} XP at mastery
                    </div>
                  </div>
                  <div className="meta">
                    <AreaChip area={c.area} />
                    <PlatformBadge platform={c.platform} />
                  </div>
                  <div className="barwrap">
                    <Bar value={c.progress} slim />
                    <span className="pct">{c.progress}%</span>
                  </div>
                </div>
              ))}
            </Window>
          </section>
        );
      })}
    </>
  );
}
