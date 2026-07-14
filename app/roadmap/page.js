import roadmap from "@/data/roadmap.json";
import { GATE_RANKS } from "@/lib/xp";
import { Bar, Window } from "@/components/ui";

export const metadata = { title: "GATES · Zero → Robot" };

const STATUS_LABEL = { active: "IN PROGRESS", done: "CLEARED", upcoming: "LOCKED" };

export default function Gates() {
  return (
    <>
      <div className="page-head">
        <h1>
          GATE <span className="accent">MAP</span>
        </h1>
        <p>
          Six gates from E-rank to S-rank. Clear every quest inside a gate to
          unlock the next. Each gate ends with a <b>BOSS</b> — the deliverable
          that proves the gate is truly cleared.
        </p>
      </div>
      <div style={{ marginTop: 26 }}>
        {roadmap.phases.map((p) => {
          const rank = GATE_RANKS[p.id];
          const done = p.milestones.filter((m) => m.done).length;
          const pct = Math.round((done / p.milestones.length) * 100);
          const locked = p.status === "upcoming";
          return (
            <div className={`gate${locked ? " locked" : ""}`} key={p.id}>
              <Window>
                <div className="g-top">
                  <div className="g-rank" style={{ "--rk": `var(--rank-${rank.toLowerCase()})` }}>
                    {rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div className="g-code">
                      GATE {String(p.id).padStart(2, "0")} · {rank}-RANK
                    </div>
                    <h3>{p.name}</h3>
                    <div className="g-window">{p.window}</div>
                  </div>
                  <span className={`badge ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                </div>
                <p className="g-goal">{p.goal}</p>
                <ul className="quest-list">
                  {p.milestones.map((m, i) => {
                    const isBoss = m.text.startsWith("DELIVERABLE");
                    return (
                      <li key={i} className={`${m.done ? "done" : ""}${isBoss ? " boss" : ""}`}>
                        <span className="diamond" />
                        <span className="qtext">
                          {isBoss && <span className="boss-tag">BOSS</span>}
                          {isBoss ? m.text.replace(/^DELIVERABLE\s*—\s*/, "") : m.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="g-meta">
                  <Bar value={pct} slim gold={rank === "S"} />
                  <span className="n">
                    {done}/{p.milestones.length} QUESTS
                  </span>
                </div>
              </Window>
            </div>
          );
        })}
      </div>
    </>
  );
}
