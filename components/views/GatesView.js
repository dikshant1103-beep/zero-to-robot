"use client";
import { useState, useTransition } from "react";
import { gateRank } from "@/lib/xp";
import { Bar, Window } from "@/components/ui";
import {
  toggleMilestone,
  updateMilestone,
  addMilestone,
  deleteMilestone,
  addPhase,
  updatePhase,
  deletePhase,
} from "@/lib/actions";
import { setMilestoneProof, extractShadow } from "@/lib/actions";

const STATUS_LABEL = { active: "IN PROGRESS", done: "CLEARED", upcoming: "LOCKED" };

function Quest({ m, editable }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.text);
  const isBoss = m.text.startsWith("DELIVERABLE");

  if (editing) {
    return (
      <li>
        <span className="diamond" />
        <form
          className="sys-form inline"
          action={() => {
            start(async () => {
              await updateMilestone(m.dbId, text);
              setEditing(false);
            });
          }}
        >
          <input className="sys-input" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          <button className="sys-btn" disabled={pending}>SAVE</button>
          <button type="button" className="sys-btn ghost" onClick={() => { setText(m.text); setEditing(false); }}>
            ✕
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={`${m.done ? "done" : ""}${isBoss ? " boss" : ""}${pending ? " pending" : ""}`}>
      {editable ? (
        <button
          className="q-toggle"
          title={m.done ? "Mark quest incomplete" : "Clear quest (+150 XP)"}
          onClick={() => start(() => toggleMilestone(m.dbId))}
          disabled={pending}
        >
          <span className="diamond" />
        </button>
      ) : (
        <span className="diamond" />
      )}
      <span className="qtext">
        {isBoss && <span className="boss-tag">BOSS</span>}
        {isBoss ? m.text.replace(/^DELIVERABLE\s*—\s*/, "") : m.text}
        {m.proof && (
          <a
            className={`proof ${m.proofVerified ? "verified" : ""}`}
            href={m.proof}
            target="_blank"
            rel="noreferrer"
            title={m.proofVerified ? "Proof verified — link resolves" : "Proof attached (unverified)"}
          >
            {m.proofVerified ? "◆ VERIFIED" : "◇ PROOF"}
          </a>
        )}
      </span>
      {editable && (
        <span className="q-actions">
          <button
            className="icon-btn"
            title="Attach proof of work (commit, PR, or repo URL)"
            disabled={pending}
            onClick={() => {
              const url = prompt("Proof of work — paste a GitHub/GitLab URL:", m.proof || "");
              if (url !== null) start(() => setMilestoneProof(m.dbId, url));
            }}
          >
            ⚿
          </button>
          <button className="icon-btn" title="Edit quest" onClick={() => setEditing(true)}>✎</button>
          <button
            className="icon-btn danger"
            title="Delete quest"
            onClick={() => {
              if (confirm("Delete this quest?")) start(() => deleteMilestone(m.dbId));
            }}
          >
            ✕
          </button>
        </span>
      )}
    </li>
  );
}

function AddQuest({ phaseDbId }) {
  const [pending, start] = useTransition();
  const [text, setText] = useState("");
  const [boss, setBoss] = useState(false);
  return (
    <form
      className="sys-form inline add-quest"
      action={() => {
        const t = text.trim();
        if (!t) return;
        start(async () => {
          await addMilestone(phaseDbId, boss ? `DELIVERABLE — ${t}` : t);
          setText("");
          setBoss(false);
        });
      }}
    >
      <input
        className="sys-input"
        placeholder="New quest…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label className="sys-check">
        <input type="checkbox" checked={boss} onChange={(e) => setBoss(e.target.checked)} />
        BOSS
      </label>
      <button className="sys-btn" disabled={pending || !text.trim()}>+ ADD QUEST</button>
    </form>
  );
}

function GateEditor({ p, onClose }) {
  const [pending, start] = useTransition();
  const [f, setF] = useState({ name: p.name, window: p.window, goal: p.goal, status: p.status });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="sys-form stack"
      action={() => {
        if (!f.name.trim()) return;
        start(async () => {
          await updatePhase(p.dbId, f);
          onClose();
        });
      }}
    >
      <div className="sys-grid">
        <label>
          GATE NAME
          <input className="sys-input" value={f.name} onChange={set("name")} />
        </label>
        <label>
          WINDOW
          <input className="sys-input" value={f.window} onChange={set("window")} placeholder="e.g. Aug – Oct 2026" />
        </label>
        <label>
          STATUS
          <select className="sys-input" value={f.status} onChange={set("status")}>
            <option value="upcoming">LOCKED</option>
            <option value="active">IN PROGRESS</option>
            <option value="done">CLEARED</option>
          </select>
        </label>
      </div>
      <label>
        GOAL
        <textarea className="sys-input" rows={2} value={f.goal} onChange={set("goal")} />
      </label>
      <div className="sys-row">
        <button className="sys-btn" disabled={pending}>SAVE GATE</button>
        <button type="button" className="sys-btn ghost" onClick={onClose}>CANCEL</button>
        <button
          type="button"
          className="sys-btn danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete gate "${p.name}" and all its quests?`))
              start(() => deletePhase(p.dbId));
          }}
        >
          DELETE GATE
        </button>
      </div>
    </form>
  );
}

function AddGate() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [f, setF] = useState({ name: "", window: "", goal: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (!open)
    return (
      <button className="sys-btn big" onClick={() => setOpen(true)}>
        + OPEN NEW GATE
      </button>
    );
  return (
    <Window title="New Gate">
      <form
        className="sys-form stack"
        action={() => {
          if (!f.name.trim()) return;
          start(async () => {
            await addPhase(f);
            setF({ name: "", window: "", goal: "" });
            setOpen(false);
          });
        }}
      >
        <div className="sys-grid">
          <label>
            GATE NAME
            <input className="sys-input" value={f.name} onChange={set("name")} autoFocus />
          </label>
          <label>
            WINDOW
            <input className="sys-input" value={f.window} onChange={set("window")} placeholder="e.g. Nov 2027" />
          </label>
        </div>
        <label>
          GOAL
          <textarea className="sys-input" rows={2} value={f.goal} onChange={set("goal")} />
        </label>
        <div className="sys-row">
          <button className="sys-btn" disabled={pending || !f.name.trim()}>CREATE GATE</button>
          <button type="button" className="sys-btn ghost" onClick={() => setOpen(false)}>CANCEL</button>
        </div>
      </form>
    </Window>
  );
}

// A fully cleared gate can be extracted into the Shadow Army — the permanent
// record of what you actually built.
function ExtractShadow({ phaseDbId, name }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="sys-btn gold big"
      disabled={pending}
      title={`Extract "${name}" as a shadow`}
      onClick={() => start(() => extractShadow(phaseDbId))}
    >
      ◆ ARISE — EXTRACT SHADOW
    </button>
  );
}

export default function GatesView({ phases, editable = false }) {
  const [editingGate, setEditingGate] = useState(null);
  return (
    <>
      <div className="page-head">
        <h1>
          GATE <span className="accent">MAP</span>
        </h1>
        <p>
          Gates run from E-rank to S-rank. Clear every quest inside a gate to
          unlock the next. Each gate ends with a <b>BOSS</b> — the deliverable
          that proves the gate is truly cleared.
          {editable && " Click a quest's diamond to clear it (+150 XP)."}
        </p>
      </div>
      <div style={{ marginTop: 26 }}>
        {phases.map((p, idx) => {
          const rank = gateRank(p.id ?? idx);
          const done = p.milestones.filter((m) => m.done).length;
          const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0;
          const locked = p.status === "upcoming" && !editable;
          return (
            <div className={`gate${locked ? " locked" : ""}`} key={p.dbId ?? p.id}>
              <Window>
                <div className="g-top">
                  <div className="g-rank" style={{ "--rk": `var(--rank-${rank.toLowerCase()})` }}>
                    {rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div className="g-code">
                      GATE {String(p.id ?? idx).padStart(2, "0")} · {rank}-RANK
                    </div>
                    <h3>{p.name}</h3>
                    <div className="g-window">{p.window}</div>
                  </div>
                  <span className={`badge ${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span>
                  {editable && (
                    <button
                      className="icon-btn"
                      title="Edit gate"
                      onClick={() => setEditingGate(editingGate === p.dbId ? null : p.dbId)}
                    >
                      ✎
                    </button>
                  )}
                </div>
                {editable && editingGate === p.dbId ? (
                  <GateEditor p={p} onClose={() => setEditingGate(null)} />
                ) : (
                  <>
                    <p className="g-goal">{p.goal}</p>
                    <ul className="quest-list">
                      {p.milestones.map((m, i) => (
                        <Quest key={m.dbId ?? i} m={m} editable={editable} />
                      ))}
                    </ul>
                    {editable && <AddQuest phaseDbId={p.dbId} />}
                    {editable && p.milestones.length > 0 && done === p.milestones.length && (
                      <ExtractShadow phaseDbId={p.dbId} name={p.name} />
                    )}
                    <div className="g-meta">
                      <Bar value={pct} slim gold={rank === "S"} />
                      <span className="n">
                        {done}/{p.milestones.length} QUESTS
                      </span>
                    </div>
                  </>
                )}
              </Window>
            </div>
          );
        })}
        {editable && <AddGate />}
      </div>
    </>
  );
}
