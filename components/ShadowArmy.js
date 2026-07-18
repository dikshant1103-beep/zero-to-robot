"use client";
import { useState, useTransition } from "react";
import { Window } from "@/components/ui";
import { nameShadow, dismissShadow } from "@/lib/actions";

// Every gate you fully clear can be extracted as a shadow — the portfolio
// view of the journey. Rename it after whatever you actually built.
export default function ShadowArmy({ shadows = [], editable = false }) {
  if (!editable && shadows.length === 0) return null;

  return (
    <Window title={`Shadow Army — ${shadows.length}`}>
      {shadows.length === 0 ? (
        <p className="muted-note" style={{ padding: "8px 0" }}>
          No shadows extracted. Clear every quest in a gate, then extract it from
          the gate map — each one becomes a permanent record of what you built.
        </p>
      ) : (
        <div className="shadow-grid">
          {shadows.map((sh) => (
            <ShadowCard key={sh.dbId} sh={sh} editable={editable} />
          ))}
        </div>
      )}
    </Window>
  );
}

function ShadowCard({ sh, editable }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sh.name);
  const [url, setUrl] = useState(sh.url || "");

  if (editing) {
    return (
      <form
        className="shadow sys-form stack"
        action={() =>
          start(async () => {
            await nameShadow(sh.dbId, name, url);
            setEditing(false);
          })
        }
      >
        <input className="sys-input" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="sys-input"
          value={url}
          placeholder="https://github.com/… (optional)"
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="sys-row">
          <button className="sys-btn tiny" disabled={pending || !name.trim()}>SAVE</button>
          <button type="button" className="sys-btn ghost tiny" onClick={() => setEditing(false)}>
            CANCEL
          </button>
          <button
            type="button"
            className="sys-btn danger tiny"
            onClick={() => {
              if (confirm(`Dismiss shadow "${sh.name}"?`)) start(() => dismissShadow(sh.dbId));
            }}
          >
            DISMISS
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="shadow">
      <div className="shadow-mark">◆</div>
      <div className="shadow-body">
        <div className="shadow-name">
          {sh.url ? (
            <a href={sh.url} target="_blank" rel="noreferrer">
              {sh.name} ↗
            </a>
          ) : (
            sh.name
          )}
        </div>
        <div className="shadow-meta">
          {sh.role} · EXTRACTED {sh.extracted}
        </div>
      </div>
      {editable && (
        <button className="icon-btn" title="Rename shadow" onClick={() => setEditing(true)}>
          ✎
        </button>
      )}
    </div>
  );
}
