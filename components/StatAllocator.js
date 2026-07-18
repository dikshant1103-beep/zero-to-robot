"use client";
import { useTransition } from "react";
import { allocPoint, resetPoints } from "@/lib/actions";

// The stats grid. Read-only on public pages; on /me each stat gains a +
// button while free points remain.
export default function StatAllocator({ stats, points, editable = false }) {
  const [pending, start] = useTransition();
  const free = points?.free ?? 0;

  return (
    <>
      <div className="stats">
        {stats.map((st) => (
          <div className="stat" key={st.key}>
            <div className="k">{st.key}</div>
            <div className="v">
              {st.value}
              {st.allocated > 0 && <sup className="alloc">+{st.allocated}</sup>}
            </div>
            <div className="s">{st.label}</div>
            {editable && free > 0 && (
              <button
                className="stat-plus"
                title={`Allocate a point to ${st.key}`}
                disabled={pending}
                onClick={() => start(() => allocPoint(st.key))}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <div className="alloc-bar">
          {free > 0 ? (
            <b className="gold-text">
              ◆ {free} FREE POINT{free === 1 ? "" : "S"} — ALLOCATE THEM
            </b>
          ) : (
            <span className="muted-note">
              No free points. Level up to earn more ({points?.spent ?? 0} allocated).
            </span>
          )}
          {(points?.spent ?? 0) > 0 && (
            <button
              className="sys-btn ghost tiny"
              disabled={pending}
              onClick={() => {
                if (confirm("Return all allocated points?")) start(() => resetPoints());
              }}
            >
              RESPEC
            </button>
          )}
        </div>
      )}
    </>
  );
}
