"use client";
import { useState, useTransition } from "react";
import { Bar, AreaChip, Window } from "@/components/ui";
import Link from "next/link";
import { AREA_COLORS } from "@/lib/meta";
import { bookSlug, librarySource } from "@/lib/library";
import { setChaptersRead, addBook, updateBook, deleteBook, setBookOwned } from "@/lib/actions";

const AREAS = Object.keys(AREA_COLORS);

// READ/DOWNLOAD for tomes the authors publish free; buy/borrow for the rest.
// `local` holds slugs of PDFs you own in books/local/ — dev only, always empty
// in a deploy, and they take priority over the public source.
function BookLinks({ b, local = [] }) {
  const slug = bookSlug(b.title);
  const src = librarySource(b.title);

  if (local.includes(slug)) {
    return (
      <>
        <Link className="sys-btn tiny" href={`/read/${slug}`}>
          READ
        </Link>
        <a className="sys-btn ghost tiny" href={`/api/local-book/${slug}`} download>
          DOWNLOAD
        </a>
        <span className="own-tag">MY COPY</span>
      </>
    );
  }

  if (!src) {
    return b.free ? (
      <a className="sys-btn ghost tiny" href={b.free} target="_blank" rel="noreferrer">
        SOURCE ↗
      </a>
    ) : null;
  }
  if (src.url) {
    return (
      <>
        <Link className="sys-btn tiny" href={`/read/${slug}`}>
          READ
        </Link>
        <a
          className="sys-btn ghost tiny"
          href={src.url}
          target="_blank"
          rel="noreferrer"
          {...(src.kind === "pdf" ? { download: true } : {})}
        >
          {src.kind === "pdf" ? "DOWNLOAD" : "OPEN ↗"}
        </a>
      </>
    );
  }
  return (
    <>
      <a className="sys-btn gold tiny" href={src.buy} target="_blank" rel="noreferrer">
        ACQUIRE ↗
      </a>
      <a className="sys-btn ghost tiny" href={src.borrow} target="_blank" rel="noreferrer">
        BORROW FREE ↗
      </a>
    </>
  );
}

// An owned tome is "bound": +25% XP on every chapter absorbed from it.
function ArtifactState({ b, editable }) {
  const [pending, start] = useTransition();
  if (b.owned) {
    return (
      <span className="artifact bound">
        ◆ BOUND · +25% XP
        {editable && (
          <button
            className="unbind"
            title="Mark as no longer owned"
            disabled={pending}
            onClick={() => start(() => setBookOwned(b.dbId, false))}
          >
            ✕
          </button>
        )}
      </span>
    );
  }
  if (!editable) return <span className="artifact">◇ UNBOUND</span>;
  return (
    <button
      className="sys-btn ghost tiny"
      disabled={pending}
      title="Bind this tome — chapters from it pay +25% XP"
      onClick={() => start(() => setBookOwned(b.dbId, true))}
    >
      I OWN THIS
    </button>
  );
}

function BookFields({ f, set }) {
  return (
    <>
      <div className="sys-grid">
        <label>
          TITLE
          <input className="sys-input" value={f.title} onChange={set("title")} />
        </label>
        <label>
          AUTHORS
          <input className="sys-input" value={f.authors} onChange={set("authors")} />
        </label>
        <label>
          FREE URL
          <input className="sys-input" value={f.free || ""} onChange={set("free")} placeholder="https://… (optional)" />
        </label>
      </div>
      <div className="sys-grid">
        <label>
          DISCIPLINE
          <select className="sys-input" value={f.area} onChange={set("area")}>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          GATE(S)
          <input className="sys-input" value={f.phase} onChange={set("phase")} placeholder="e.g. 1–2" />
        </label>
        <label>
          SHELF
          <select className="sys-input" value={f.priority} onChange={set("priority")}>
            <option value="core">CORE</option>
            <option value="reference">REFERENCE</option>
          </select>
        </label>
        <label>
          CHAPTERS
          <input className="sys-input" type="number" min="1" max="99" value={f.chaptersTotal} onChange={set("chaptersTotal")} />
        </label>
      </div>
      <label>
        WHY THIS TOME
        <textarea className="sys-input" rows={2} value={f.why} onChange={set("why")} />
      </label>
    </>
  );
}

function BookRow({ b, editable, local }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pct = Math.round((b.chaptersRead / b.chaptersTotal) * 100);

  if (editing) {
    return (
      <div className="row">
        <form
          className="sys-form stack"
          style={{ gridColumn: "1 / -1" }}
          action={() => {
            if (!f.title.trim()) return;
            start(async () => {
              await updateBook(b.dbId, f);
              setEditing(false);
            });
          }}
        >
          <BookFields f={f} set={set} />
          <div className="sys-row">
            <button className="sys-btn" disabled={pending}>SAVE</button>
            <button type="button" className="sys-btn ghost" onClick={() => setEditing(false)}>CANCEL</button>
            <button
              type="button"
              className="sys-btn danger"
              onClick={() => {
                if (confirm(`Remove tome "${b.title}"?`)) start(() => deleteBook(b.dbId));
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
          {b.free ? (
            <a href={b.free} target="_blank" rel="noreferrer">
              「{b.title}」 ↗
            </a>
          ) : (
            <>「{b.title}」</>
          )}
        </div>
        <div className="sub">
          {b.authors} · Gate {b.phase}
          {b.free ? " · FREE DROP" : ""} · +30 XP per chapter
        </div>
        <div className="book-links">
          <BookLinks b={b} local={local} />
          <ArtifactState b={b} editable={editable} />
        </div>
      </div>
      <div className="meta">
        <AreaChip area={b.area} />
        {editable && (
          <button
            className="icon-btn"
            title="Edit tome"
            onClick={() => {
              setF({
                title: b.title,
                authors: b.authors,
                free: b.free || "",
                area: b.area,
                phase: b.phase,
                priority: b.priority,
                chaptersTotal: b.chaptersTotal,
                why: b.why,
              });
              setEditing(true);
            }}
          >
            ✎
          </button>
        )}
      </div>
      <div className="why">{b.why}</div>
      <div className="barwrap">
        <Bar value={pct} slim />
        {editable && (
          <span className="stepper">
            <button
              className="icon-btn"
              title="Chapter un-read"
              disabled={pending || b.chaptersRead <= 0}
              onClick={() => start(() => setChaptersRead(b.dbId, b.chaptersRead - 1))}
            >
              −
            </button>
            <button
              className="icon-btn"
              title="Absorb chapter (+30 XP)"
              disabled={pending || b.chaptersRead >= b.chaptersTotal}
              onClick={() => start(() => setChaptersRead(b.dbId, b.chaptersRead + 1))}
            >
              +
            </button>
          </span>
        )}
        <span className="pct">
          {b.chaptersRead}/{b.chaptersTotal}
        </span>
      </div>
    </div>
  );
}

function Shelf({ list, editable, local }) {
  return (
    <Window style={{ paddingTop: 8, paddingBottom: 8 }}>
      {list.map((b) => (
        <BookRow key={b.dbId ?? b.title} b={b} editable={editable} local={local} />
      ))}
      {list.length === 0 && (
        <p style={{ color: "var(--muted)", padding: "14px 0" }}>Shelf is empty.</p>
      )}
    </Window>
  );
}

function AddBook() {
  const empty = { title: "", authors: "", free: "", area: "Robotics", phase: "1", priority: "core", chaptersTotal: 10, why: "" };
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (!open)
    return (
      <button className="sys-btn big" onClick={() => setOpen(true)}>
        + ADD TOME
      </button>
    );
  return (
    <Window title="New Tome">
      <form
        className="sys-form stack"
        action={() => {
          if (!f.title.trim()) return;
          start(async () => {
            await addBook(f);
            setF(empty);
            setOpen(false);
          });
        }}
      >
        <BookFields f={f} set={set} />
        <div className="sys-row">
          <button className="sys-btn" disabled={pending || !f.title.trim()}>ADD TOME</button>
          <button type="button" className="sys-btn ghost" onClick={() => setOpen(false)}>CANCEL</button>
        </div>
      </form>
    </Window>
  );
}

export default function TomesView({ books, editable = false, local = [] }) {
  const core = books.books.filter((b) => b.priority === "core");
  const ref = books.books.filter((b) => b.priority === "reference");
  return (
    <>
      <div className="page-head">
        <h1>
          SKILL <span className="accent">TOMES</span>
        </h1>
        <p>
          Core tomes in reading order — absorb them chapter by chapter; each
          chapter grants XP toward the stat its discipline feeds.
          {editable && " Hit + when you finish a chapter (+30 XP)."} Tomes you own
          are <b className="gold-text">BOUND</b> artifacts — their chapters pay
          +25% XP. The free tomes come bound; the rest bind when you acquire a
          legitimate copy.
        </p>
      </div>
      {editable && (
        <div style={{ marginTop: 20 }}>
          <AddBook />
        </div>
      )}
      <div className="section-label">
        CORE TOMES — <b>ABSORB IN THIS ORDER</b>
      </div>
      <Shelf list={core} editable={editable} local={local} />
      <div className="section-label">REFERENCE SHELF — CONSULT, DON'T GRIND</div>
      <Shelf list={ref} editable={editable} local={local} />
    </>
  );
}
