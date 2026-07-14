import Link from "next/link";
import roadmap from "@/data/roadmap.json";
import log from "@/data/log.json";
import { getSystem } from "@/lib/xp";
import { Bar, Window, SysAlert } from "@/components/ui";

export default function Home() {
  const s = getSystem();
  const phase = s.activePhase;
  const dailyQuests = phase.milestones.filter((m) => !m.done).slice(0, 4);
  const latest = log.entries[0];

  return (
    <>
      <section className="hero">
        <div className="sys-tag">⟨ SYSTEM ⟩</div>
        <h1>
          ZERO <span className="arrow">→</span> ROBOT
        </h1>
        <div className="tagline">
          {roadmap.commitment.toUpperCase()} · AWAKENED {roadmap.start} · 6 GATES · ~15 MONTHS
        </div>
      </section>

      <SysAlert>
        <span className="sys">[NOTIFICATION]</span> You have acquired the
        qualifications to be a <b>Player</b>. The System will now track your
        growth into an engineer who can{" "}
        <b>design a robot from scratch, train it, and deploy it</b> — humanoid
        in simulation, drone in the field. Progress cannot be faked:
        every level comes from a git push.
      </SysAlert>

      <Window title="Status">
        <div className="player">
          <div className="level-block">
            <div className="lv-label">LEVEL</div>
            <div className="lv display">{s.level}</div>
            <div className="rank-emblem">
              HUNTER RANK{" "}
              <b style={{ color: `var(--rank-${s.rank.toLowerCase()})`, textShadow: "0 0 12px currentColor" }}>
                {s.rank}
              </b>
            </div>
          </div>
          <div>
            <div className="p-rows">
              <div className="p-row">
                <span className="k">NAME</span>
                <span className="v">DIKSHANT</span>
              </div>
              <div className="p-row">
                <span className="k">JOB</span>
                <span className="v">
                  Mechanical Design Engineer{" "}
                  <span className="fade">→ Full-Stack Robotics Engineer</span>
                </span>
              </div>
              <div className="p-row">
                <span className="k">TITLE</span>
                <span className="v">「 {s.title} 」</span>
              </div>
            </div>
            <div className="xp-wrap">
              <div className="xp-nums">
                <span>
                  XP <b>{s.xp.toLocaleString()}</b>
                </span>
                <span>
                  NEXT LEVEL {s.intoLevel}/{s.xpPerLevel}
                </span>
              </div>
              <Bar value={(s.intoLevel / s.xpPerLevel) * 100} />
            </div>
            <div className="stats">
              {s.stats.map((st) => (
                <div className="stat" key={st.key}>
                  <div className="k">{st.key}</div>
                  <div className="v">{st.value}</div>
                  <div className="s">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Window>

      <div className="home-grid">
        <Window title="Quest Info">
          <div
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              marginBottom: 14,
              letterSpacing: "0.04em",
            }}
          >
            [Daily Quest: <b style={{ color: "var(--ink)" }}>Gate {phase.id} — {phase.name}</b>]
          </div>
          <ul className="quest-list">
            {dailyQuests.map((m, i) => (
              <li key={i}>
                <span className="diamond" />
                <span className="qtext">{m.text}</span>
              </li>
            ))}
          </ul>
          <div className="quest-warning">
            ⚠ WARNING: Failure to complete the daily quest will result in an
            appropriate penalty (staying a mech engineer forever).
          </div>
          <Link href="/roadmap" className="more">
            OPEN GATE MAP →
          </Link>
        </Window>

        <Window title="Raid Log — Latest">
          <div className="log-entry" style={{ marginBottom: 0 }}>
            <div className="date">
              {latest.date} · GATE {latest.phase}
            </div>
            <h3>{latest.title}</h3>
            <p>{latest.body.slice(0, 210)}…</p>
          </div>
          <div className="mini-stats" style={{ marginTop: 18 }}>
            <div className="mini-stat">
              <div className="v">
                {s.milestones.done}/{s.milestones.total}
              </div>
              <div className="k">Quests</div>
            </div>
            <div className="mini-stat">
              <div className="v">
                {s.courses.done}/{s.courses.total}
              </div>
              <div className="k">Skills</div>
            </div>
            <div className="mini-stat">
              <div className="v">
                {s.books.read}/{s.books.total}
              </div>
              <div className="k">Tome ch.</div>
            </div>
          </div>
          <Link href="/log" className="more">
            FULL RAID LOG →
          </Link>
        </Window>
      </div>
    </>
  );
}
