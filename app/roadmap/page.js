import roadmap from "@/data/roadmap.json";

export const metadata = { title: "Roadmap · Zero → Robot" };

export default function Roadmap() {
  return (
    <>
      <div className="page-head">
        <h1>Roadmap</h1>
        <p>{roadmap.mission}</p>
      </div>
      <div style={{ marginTop: 24 }}>
        {roadmap.phases.map((p) => {
          const done = p.milestones.filter((m) => m.done).length;
          return (
            <div className={`phase ${p.status}`} key={p.id}>
              <div className="rail">
                <div className="node">{p.id}</div>
                <div className="line" />
              </div>
              <div className="body">
                <h3>
                  {p.name}
                  <span className={`badge ${p.status}`}>{p.status}</span>
                  <span className="window">{p.window}</span>
                </h3>
                <p className="goal">{p.goal}</p>
                <ul className="ms">
                  {p.milestones.map((m, i) => (
                    <li key={i} className={m.done ? "done" : ""}>
                      <span className="box" />
                      <span>{m.text}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  {done}/{p.milestones.length} milestones
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
