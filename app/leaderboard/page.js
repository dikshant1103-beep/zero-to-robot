import { sql } from "@/lib/db";
import { Window } from "@/components/ui";
import { rankForLevel } from "@/lib/xp";

export const metadata = { title: "HUNTER ASSOCIATION · Zero → Robot" };
// Rankings change as players train — never prerender this.
export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  // Only opt-in players, and only the three fields they agreed to show.
  let rows = [];
  try {
    rows = await sql`
      SELECT public_name, cached_xp, cached_level
        FROM players
       WHERE on_leaderboard = true AND public_name IS NOT NULL
       ORDER BY cached_xp DESC, cached_level DESC
       LIMIT 100
    `;
  } catch {
    rows = []; // database unreachable — show the empty state, not a crash
  }

  return (
    <>
      <div className="page-head">
        <h1>
          HUNTER <span className="accent">ASSOCIATION</span>
        </h1>
        <p>
          Ranked by total XP. Listing is opt-in — players choose their own hunter
          name, and nothing else about them is shown. Join from your own STATUS
          page.
        </p>
      </div>

      <Window title={`Rankings — ${rows.length}`}>
        {rows.length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "14px 0" }}>
            No hunters have registered yet. Be the first.
          </p>
        ) : (
          <div className="lb-table">
            {rows.map((r, i) => (
              <div className={`lb-row ${i < 3 ? "top" : ""}`} key={i}>
                <div className="lb-pos">{i + 1}</div>
                <div className="lb-name">{r.public_name}</div>
                <div className="lb-rank">
                  <b style={{ color: `var(--rank-${rankForLevel(r.cached_level).toLowerCase()})` }}>
                    {rankForLevel(r.cached_level)}
                  </b>
                </div>
                <div className="lb-lv">LV {r.cached_level}</div>
                <div className="lb-xp">{r.cached_xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        )}
      </Window>
    </>
  );
}
