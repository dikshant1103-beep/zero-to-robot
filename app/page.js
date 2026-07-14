import Link from "next/link";
import roadmap from "@/data/roadmap.json";
import log from "@/data/log.json";
import { getStats } from "@/lib/stats";
import { Bar } from "@/components/ui";

export default function Home() {
  const s = getStats();
  const phase = s.activePhase;
  const nextMs = phase.milestones.filter((m) => !m.done).slice(0, 3);
  const latest = log.entries[0];

  return (
    <>
      <section className="hero">
        <h1>
          ZERO <span className="arrow">→</span> ROBOT
        </h1>
        <div className="tagline">
          {roadmap.commitment} · started {roadmap.start} · 6 phases · ~15 months
        </div>
        <p className="mission">{roadmap.mission}</p>
      </section>

      <div className="grid tiles">
        <div className="card tile">
          <div className="k">Overall progress</div>
          <div className="v">{s.overall}%</div>
          <div className="s">
            {s.milestones.done}/{s.milestones.total} milestones
          </div>
          <div style={{ marginTop: 10 }}>
            <Bar value={s.overall} thick />
          </div>
        </div>
        <div className="card tile">
          <div className="k">Current phase</div>
          <div className="v">{phase.id}</div>
          <div className="s">{phase.name}</div>
        </div>
        <div className="card tile">
          <div className="k">Courses</div>
          <div className="v">
            {s.courses.done}/{s.courses.total}
          </div>
          <div className="s">avg {s.courses.avg}% watched</div>
        </div>
        <div className="card tile">
          <div className="k">Core books</div>
          <div className="v">
            {s.books.read}
            <span style={{ fontSize: 18, color: "var(--muted)" }}>
              /{s.books.total}
            </span>
          </div>
          <div className="s">chapters across {s.books.core} books</div>
        </div>
      </div>

      <div className="home-grid">
        <div className="card focus-card">
          <div className="k">Now — Phase {phase.id}</div>
          <h3>{phase.name}</h3>
          <p>{phase.goal}</p>
          <ul className="mini-list">
            {nextMs.map((m, i) => (
              <li key={i}>
                <span>▸ {m.text}</span>
              </li>
            ))}
          </ul>
          <Link href="/roadmap" className="more">
            Full roadmap →
          </Link>
        </div>
        <div className="card">
          <h2>Latest from the build log</h2>
          <ul className="mini-list">
            <li>
              <b>{latest.title}</b>
            </li>
            <li>
              <span style={{ color: "var(--muted)" }}>{latest.date}</span>
            </li>
            <li>
              <span>{latest.body.slice(0, 180)}…</span>
            </li>
          </ul>
          <Link href="/log" className="more">
            Read the log →
          </Link>
        </div>
      </div>
    </>
  );
}
