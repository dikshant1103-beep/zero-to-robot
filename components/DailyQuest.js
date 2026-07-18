"use client";
import { useState, useTransition } from "react";
import { Bar, Window } from "@/components/ui";
import { setDailyTarget } from "@/lib/actions";

const TARGETS = [30, 60, 120, 240];

export default function DailyQuest({ daily }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  if (!daily) return null;

  const { target, todayXP, clearedToday, streak, bestStreak, penalty, daysMissed, pct } = daily;

  return (
    <Window
      title={penalty ? "Penalty Zone" : "Daily Quest"}
      className={penalty ? "penalty" : clearedToday ? "cleared" : ""}
    >
      <div className="dq">
        <div className="dq-main">
          <div className="dq-head">
            {clearedToday ? (
              <b className="ok">◆ DAILY QUEST CLEARED</b>
            ) : penalty ? (
              <b className="bad">
                ✕ STREAK BROKEN — {daysMissed} DAY{daysMissed === 1 ? "" : "S"} MISSED
              </b>
            ) : (
              <b>TRAIN TODAY — {target - todayXP} XP REMAINING</b>
            )}
            <span className="dq-nums">
              {todayXP} / {target} XP
            </span>
          </div>
          <Bar value={pct} />
          <p className="dq-note">
            {clearedToday
              ? "The System is satisfied. Return tomorrow."
              : penalty
                ? "You failed to train. The chain is severed — clear today's quest to begin a new one."
                : "Any XP counts: clear a quest, absorb a chapter, advance a skill."}
          </p>
        </div>

        <div className="dq-streak">
          <div className={`streak-n ${streak > 0 ? "lit" : ""}`}>{streak}</div>
          <div className="streak-l">DAY STREAK</div>
          <div className="streak-b">BEST {bestStreak}</div>
        </div>
      </div>

      <div className="dq-foot">
        {editing ? (
          <span className="sys-row">
            <span className="dq-label">DAILY TARGET</span>
            {TARGETS.map((t) => (
              <button
                key={t}
                className={`sys-btn tiny ${t === target ? "gold" : "ghost"}`}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await setDailyTarget(t);
                    setEditing(false);
                  })
                }
              >
                {t} XP
              </button>
            ))}
            <button className="sys-btn ghost tiny" onClick={() => setEditing(false)}>
              CANCEL
            </button>
          </span>
        ) : (
          <button className="sys-btn ghost tiny" onClick={() => setEditing(true)}>
            CHANGE TARGET
          </button>
        )}
      </div>
    </Window>
  );
}
