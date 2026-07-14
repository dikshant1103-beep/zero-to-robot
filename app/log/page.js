import log from "@/data/log.json";
import { Window } from "@/components/ui";

export const metadata = { title: "RAID LOG · Zero → Robot" };

export default function RaidLog() {
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
        {log.entries.map((e) => (
          <Window key={e.date + e.title}>
            <article className="log-entry" style={{ marginBottom: 0 }}>
              <div className="date">
                {e.date} · GATE {e.phase}
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
        ))}
      </div>
    </>
  );
}
