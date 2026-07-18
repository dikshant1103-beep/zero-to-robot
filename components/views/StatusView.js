import Link from "next/link";
import { Bar, Window, SysAlert } from "@/components/ui";
import DailyQuest from "@/components/DailyQuest";
import StatAllocator from "@/components/StatAllocator";
import ShadowArmy from "@/components/ShadowArmy";
import LeaderboardOptIn from "@/components/LeaderboardOptIn";

export default function StatusView({
  system: s,
  log,
  player,
  tagline,
  notification,
  base = "",
  daily = null,
  shadows = [],
  editable = false,
}) {
  const phase = s.activePhase;
  const dailyQuests = phase ? phase.milestones.filter((m) => !m.done).slice(0, 4) : [];
  const latest = log.entries[0];

  return (
    <>
      <section className="hero">
        <div className="sys-tag">⟨ SYSTEM ⟩</div>
        <h1>
          ZERO <span className="arrow">→</span> ROBOT
        </h1>
        <div className="tagline">{tagline}</div>
      </section>

      <SysAlert>{notification}</SysAlert>

      {daily && <DailyQuest daily={daily} />}

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
                <span className="v">{player.name}</span>
              </div>
              <div className="p-row">
                <span className="k">JOB</span>
                <span className="v">{player.job}</span>
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
            <StatAllocator stats={s.stats} points={s.points} editable={editable} />
          </div>
        </div>
      </Window>

      <div className="home-grid">
        <Window title="Active Gate">
          <div
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              marginBottom: 14,
              letterSpacing: "0.04em",
            }}
          >
            [Current objective:{" "}
            <b style={{ color: "var(--ink)" }}>
              Gate {phase ? `${phase.id ?? phase.position} — ${phase.name}` : "—"}
            </b>
            ]
          </div>
          <ul className="quest-list">
            {dailyQuests.map((m, i) => (
              <li key={i}>
                <span className="diamond" />
                <span className="qtext">{m.text}</span>
              </li>
            ))}
            {dailyQuests.length === 0 && (
              <li>
                <span className="diamond" />
                <span className="qtext">All quests in this gate are cleared. Open the gate map.</span>
              </li>
            )}
          </ul>
          <div className="quest-warning">
            ⚠ WARNING: Failure to complete the daily quest will result in an
            appropriate penalty (staying a mech engineer forever).
          </div>
          <Link href={`${base}/roadmap`} className="more">
            OPEN GATE MAP →
          </Link>
        </Window>

        <Window title="Raid Log — Latest">
          {latest ? (
            <div className="log-entry" style={{ marginBottom: 0 }}>
              <div className="date">
                {latest.date} · GATE {latest.phase}
              </div>
              <h3>{latest.title}</h3>
              <p>{latest.body.slice(0, 210)}…</p>
            </div>
          ) : (
            <p style={{ color: "var(--muted)" }}>No raids recorded yet.</p>
          )}
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
          <Link href={`${base}/log`} className="more">
            FULL RAID LOG →
          </Link>
        </Window>
      </div>

      <ShadowArmy shadows={shadows} editable={editable} />

      {editable && (
        <Window title="Hunter Association">
          <LeaderboardOptIn
            onLeaderboard={player.onLeaderboard}
            publicName={player.publicName}
          />
        </Window>
      )}
    </>
  );
}
