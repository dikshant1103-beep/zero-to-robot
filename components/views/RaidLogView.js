"use client";
import { useState, useTransition } from "react";
import { Window } from "@/components/ui";
import { addLogEntry, deleteLogEntry } from "@/lib/actions";

function AddEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const empty = { date: today, phase: 0, title: "", body: "" };
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (!open)
    return (
      <button className="sys-btn big" onClick={() => setOpen(true)}>
        + RECORD NEW RAID
      </button>
    );
  return (
    <Window title="New Raid Entry">
      <form
        className="sys-form stack"
        action={() => {
          if (!f.title.trim()) return;
          start(async () => {
            await addLogEntry(f);
            setF({ ...empty, date: new Date().toISOString().slice(0, 10) });
            setOpen(false);
          });
        }}
      >
        <div className="sys-grid">
          <label>
            DATE
            <input className="sys-input" type="date" value={f.date} onChange={set("date")} />
          </label>
          <label>
            GATE #
            <input className="sys-input" type="number" min="0" max="20" value={f.phase} onChange={set("phase")} />
          </label>
          <label>
            TITLE
            <input className="sys-input" value={f.title} onChange={set("title")} placeholder="What fell today?" />
          </label>
        </div>
        <label>
          RAID REPORT
          <textarea
            className="sys-input"
            rows={4}
            value={f.body}
            onChange={set("body")}
            placeholder="What got built, learned, broken, and fixed…"
          />
        </label>
        <div className="sys-row">
          <button className="sys-btn" disabled={pending || !f.title.trim()}>RECORD RAID</button>
          <button type="button" className="sys-btn ghost" onClick={() => setOpen(false)}>CANCEL</button>
        </div>
      </form>
    </Window>
  );
}

function Entry({ e, editable }) {
  const [pending, start] = useTransition();
  return (
    <Window>
      <article className="log-entry" style={{ marginBottom: 0 }}>
        <div className="date" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>
            {e.date} · GATE {e.phase}
          </span>
          {editable && (
            <button
              className="icon-btn danger"
              title="Delete entry"
              disabled={pending}
              onClick={() => {
                if (confirm("Delete this raid entry?")) start(() => deleteLogEntry(e.dbId));
              }}
            >
              ✕
            </button>
          )}
        </div>
        <h3>{e.title}</h3>
        <p>{e.body}</p>
        {e.links && e.links.length > 0 && (
          <p style={{ marginTop: 10 }}>
            {e.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)", marginRight: 16 }}
              >
                {l.label} ↗
              </a>
            ))}
          </p>
        )}
      </article>
    </Window>
  );
}

export default function RaidLogView({ log, editable = false }) {
  return (
    <>
      <div className="page-head">
        <h1>
          RAID <span className="accent">LOG</span>
        </h1>
        <p>
          Every raid recorded: what got built, learned, broken, and fixed. CAD
          renders, sim videos, wiring photos, and training curves land here as
          the gates fall.
        </p>
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {editable && <AddEntry />}
        {log.entries.map((e, i) => (
          <Entry key={e.dbId ?? e.date + e.title} e={e} editable={editable} />
        ))}
        {log.entries.length === 0 && (
          <p style={{ color: "var(--muted)" }}>No raids recorded yet. The System is watching.</p>
        )}
      </div>
    </>
  );
}
