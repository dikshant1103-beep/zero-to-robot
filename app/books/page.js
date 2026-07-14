import books from "@/data/books.json";
import { Bar, AreaChip, Window } from "@/components/ui";

export const metadata = { title: "TOMES · Zero → Robot" };

function Shelf({ list }) {
  return (
    <Window style={{ paddingTop: 8, paddingBottom: 8 }}>
      {list.map((b) => {
        const pct = Math.round((b.chaptersRead / b.chaptersTotal) * 100);
        return (
          <div className="row" key={b.title}>
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
            </div>
            <div className="meta">
              <AreaChip area={b.area} />
            </div>
            <div className="why">{b.why}</div>
            <div className="barwrap">
              <Bar value={pct} slim />
              <span className="pct">
                {b.chaptersRead}/{b.chaptersTotal}
              </span>
            </div>
          </div>
        );
      })}
    </Window>
  );
}

export default function Tomes() {
  const core = books.books.filter((b) => b.priority === "core");
  const ref = books.books.filter((b) => b.priority === "reference");
  return (
    <>
      <div className="page-head">
        <h1>
          SKILL <span className="accent">TOMES</span>
        </h1>
        <p>
          Ten core tomes in reading order — five are free drops. Absorb them
          chapter by chapter; each chapter grants XP toward the stat its
          discipline feeds.
        </p>
      </div>
      <div className="section-label">
        CORE TOMES — <b>ABSORB IN THIS ORDER</b>
      </div>
      <Shelf list={core} />
      <div className="section-label">REFERENCE SHELF — CONSULT, DON'T GRIND</div>
      <Shelf list={ref} />
    </>
  );
}
