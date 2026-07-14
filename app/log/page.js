import log from "@/data/log.json";

export const metadata = { title: "Build Log · Zero → Robot" };

export default function Log() {
  return (
    <>
      <div className="page-head">
        <h1>Build log</h1>
        <p>
          The journal: what got built, learned, broken, and fixed. CAD renders,
          sim videos, wiring photos, and training curves land here as they
          happen.
        </p>
      </div>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {log.entries.map((e) => (
          <article className="card log-entry" key={e.date + e.title}>
            <div className="date">
              {e.date} · Phase {e.phase}
            </div>
            <h3>{e.title}</h3>
            <p>{e.body}</p>
            {e.links && e.links.length > 0 && (
              <p style={{ marginTop: 8 }}>
                {e.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--accent)", marginRight: 14 }}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
