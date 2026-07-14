import books from "@/data/books.json";
import { Bar, AreaChip } from "@/components/ui";

export const metadata = { title: "Books · Zero → Robot" };

function Shelf({ list }) {
  return (
    <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
      {list.map((b) => {
        const pct = Math.round((b.chaptersRead / b.chaptersTotal) * 100);
        return (
          <div className="row" key={b.title}>
            <div>
              <div className="title">
                {b.free ? (
                  <a href={b.free} target="_blank" rel="noreferrer">
                    {b.title} ↗
                  </a>
                ) : (
                  b.title
                )}
              </div>
              <div className="sub">
                {b.authors} · Phase {b.phase}
                {b.free ? " · FREE online" : ""}
              </div>
            </div>
            <div className="meta">
              <AreaChip area={b.area} />
            </div>
            <div className="why">{b.why}</div>
            <div className="barwrap">
              <Bar value={pct} />
              <span className="pct">
                {b.chaptersRead}/{b.chaptersTotal}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Books() {
  const core = books.books.filter((b) => b.priority === "core");
  const ref = books.books.filter((b) => b.priority === "reference");
  return (
    <>
      <div className="page-head">
        <h1>Book shelf</h1>
        <p>
          Ten core books in reading order (five are free online), plus a small
          reference shelf. Progress tracked by chapter.
        </p>
      </div>
      <div className="section-label">Core — read in this order</div>
      <Shelf list={core} />
      <div className="section-label">Reference shelf — consult, don't grind</div>
      <Shelf list={ref} />
    </>
  );
}
