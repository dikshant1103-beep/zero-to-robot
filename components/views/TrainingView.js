"use client";
import { useState, useTransition } from "react";
import { Bar, AreaChip, PlatformBadge, Window } from "@/components/ui";
import { AREA_COLORS } from "@/lib/meta";
import { setCourseProgress, addCourse, updateCourse, deleteCourse } from "@/lib/actions";

const AREAS = Object.keys(AREA_COLORS);
const PLATFORMS = ["udemy", "nptel", "free"];

function CourseFields({ f, set }) {
  return (
    <>
      <div className="sys-grid">
        <label>
          TITLE
          <input className="sys-input" value={f.title} onChange={set("title")} />
        </label>
        <label>
          INSTRUCTOR
          <input className="sys-input" value={f.instructor} onChange={set("instructor")} />
        </label>
        <label>
          URL
          <input className="sys-input" value={f.url} onChange={set("url")} placeholder="https://…" />
        </label>
      </div>
      <div className="sys-grid">
        <label>
          PLATFORM
          <select className="sys-input" value={f.platform} onChange={set("platform")}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </label>
        <label>
          DISCIPLINE
          <select className="sys-input" value={f.area} onChange={set("area")}>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          HOURS
          <input className="sys-input" type="number" min="1" max="500" value={f.hours} onChange={set("hours")} />
        </label>
        <label>
          GATE #
          <input className="sys-input" type="number" min="0" max="20" value={f.phase} onChange={set("phase")} />
        </label>
      </div>
    </>
  );
}

function CourseRow({ c, editable }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(null);
  const [prog, setProg] = useState(c.progress);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (editing) {
    return (
      <div className="row">
        <form
          className="sys-form stack"
          style={{ gridColumn: "1 / -1" }}
          action={() => {
            if (!f.title.trim()) return;
            start(async () => {
              await updateCourse(c.dbId, f);
              setEditing(false);
            });
          }}
        >
          <CourseFields f={f} set={set} />
          <div className="sys-row">
            <button className="sys-btn" disabled={pending}>SAVE</button>
            <button type="button" className="sys-btn ghost" onClick={() => setEditing(false)}>CANCEL</button>
            <button
              type="button"
              className="sys-btn danger"
              onClick={() => {
                if (confirm(`Remove skill "${c.title}"?`)) start(() => deleteCourse(c.dbId));
              }}
            >
              DELETE
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="row">
      <div>
        <div className="title">
          {c.url ? (
            <a href={c.url} target="_blank" rel="noreferrer">
              {c.title} ↗
            </a>
          ) : (
            c.title
          )}
        </div>
        <div className="sub">
          {c.instructor} · ~{c.hours} hrs · +{c.hours * 10} XP at mastery
        </div>
      </div>
      <div className="meta">
        <AreaChip area={c.area} />
        <PlatformBadge platform={c.platform} />
        {editable && (
          <button
            className="icon-btn"
            title="Edit skill"
            onClick={() => {
              setF({
                title: c.title,
                instructor: c.instructor,
                url: c.url,
                platform: c.platform,
                area: c.area,
                hours: c.hours,
                phase: c.phase,
              });
              setEditing(true);
            }}
          >
            ✎
          </button>
        )}
      </div>
      <div className="barwrap">
        {editable ? (
          <input
            type="range"
            className="sys-range"
            min="0"
            max="100"
            step="5"
            value={prog}
            disabled={pending}
            onChange={(e) => setProg(Number(e.target.value))}
            onPointerUp={() => start(() => setCourseProgress(c.dbId, prog))}
            onKeyUp={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") start(() => setCourseProgress(c.dbId, prog));
            }}
            title="Drag to update mastery"
          />
        ) : (
          <Bar value={c.progress} slim />
        )}
        <span className="pct">{editable ? prog : c.progress}%</span>
      </div>
    </div>
  );
}

function AddCourse() {
  const empty = { title: "", instructor: "", url: "", platform: "udemy", area: "CS", hours: 10, phase: 1 };
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (!open)
    return (
      <button className="sys-btn big" onClick={() => setOpen(true)}>
        + REGISTER NEW SKILL
      </button>
    );
  return (
    <Window title="Register Skill">
      <form
        className="sys-form stack"
        action={() => {
          if (!f.title.trim()) return;
          start(async () => {
            await addCourse(f);
            setF(empty);
            setOpen(false);
          });
        }}
      >
        <CourseFields f={f} set={set} />
        <div className="sys-row">
          <button className="sys-btn" disabled={pending || !f.title.trim()}>ADD SKILL</button>
          <button type="button" className="sys-btn ghost" onClick={() => setOpen(false)}>CANCEL</button>
        </div>
      </form>
    </Window>
  );
}

export default function TrainingView({ courses, editable = false }) {
  const phases = [...new Set(courses.courses.map((c) => c.phase))].sort((a, b) => a - b);
  return (
    <>
      <div className="page-head">
        <h1>
          SKILL <span className="accent">TRAINING</span>
        </h1>
        <p>
          Every skill grants XP as mastery rises — Udemy (subscription) + NPTEL
          + the best free material, grouped by the gate that needs them.
          {editable
            ? " Drag a mastery bar to log progress; register your own skills below."
            : " Udemy links are search links; after enrolling, swap in your exact course URL so one click opens the player."}
        </p>
      </div>
      {editable && (
        <div style={{ marginTop: 20 }}>
          <AddCourse />
        </div>
      )}
      {phases.map((ph) => {
        const list = courses.courses.filter((c) => c.phase === ph);
        if (list.length === 0) return null;
        return (
          <section key={ph}>
            <div className="section-label">
              REQUIRED FOR <b>GATE {String(ph).padStart(2, "0")}</b>
            </div>
            <Window style={{ paddingTop: 8, paddingBottom: 8 }}>
              {list.map((c) => (
                <CourseRow key={c.dbId ?? c.title} c={c} editable={editable} />
              ))}
            </Window>
          </section>
        );
      })}
    </>
  );
}
