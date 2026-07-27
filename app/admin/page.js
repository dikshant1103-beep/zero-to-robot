import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { Window } from "@/components/ui";
import { rankForLevel } from "@/lib/xp";

export const metadata = { title: "ADMIN · Zero → Robot" };
// Player data changes constantly — never prerender, and never cache.
export const dynamic = "force-dynamic";

// Who is allowed in. Env override so it isn't hard-coded forever; defaults to you.
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "dikshant1103@gmail.com")
  .toLowerCase()
  .split(",")
  .map((e) => e.trim());

function isAdmin(user) {
  if (!user) return false;
  return (user.emailAddresses || []).some((e) =>
    ADMIN_EMAILS.includes((e.emailAddress || "").toLowerCase())
  );
}

export default async function Admin() {
  // /admin is force-protected in middleware, so we always have a signed-in user
  // here. Gate to the admin account; everyone else gets a real 404 (the page
  // never even hints it exists).
  const user = await currentUser();
  if (!isAdmin(user)) notFound();

  // Primary source of truth: our own Neon tables. One query, all players, with
  // milestone progress joined through phases (milestones carry no user_id).
  let rows = [];
  let dbError = null;
  try {
    rows = await sql`
      SELECT p.user_id, p.name, p.job, p.awakened::text AS awakened,
             p.cached_xp, p.cached_level, p.on_leaderboard, p.public_name,
             COALESCE(ms.done_count, 0)  AS ms_done,
             COALESCE(ms.total_count, 0) AS ms_total
        FROM players p
   LEFT JOIN (
             SELECT ph.user_id,
                    COUNT(*) FILTER (WHERE m.done) AS done_count,
                    COUNT(*)                       AS total_count
               FROM phases ph
               JOIN milestones m ON m.phase_id = ph.id
              GROUP BY ph.user_id
             ) ms ON ms.user_id = p.user_id
    ORDER BY p.cached_xp DESC, p.cached_level DESC
    `;
  } catch (e) {
    dbError = String(e?.message || e);
    rows = [];
  }

  // Best-effort: enrich with real email + signup date from Clerk. Fully guarded
  // — if the Clerk API hiccups, we still render the table from Neon.
  const emailById = {};
  try {
    if (rows.length) {
      const client = await clerkClient();
      const list = await client.users.getUserList({
        userId: rows.map((r) => r.user_id),
        limit: 200,
      });
      for (const u of list.data || list) {
        const primary =
          (u.emailAddresses || []).find((e) => e.id === u.primaryEmailAddressId) ||
          (u.emailAddresses || [])[0];
        emailById[u.id] = {
          email: primary?.emailAddress || null,
          created: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : null,
        };
      }
    }
  } catch {
    /* leave emailById empty — user_id still shown */
  }

  const totalXp = rows.reduce((s, r) => s + Number(r.cached_xp || 0), 0);
  const onLb = rows.filter((r) => r.on_leaderboard).length;

  return (
    <>
      <div className="page-head">
        <h1>
          ADMIN <span className="accent">CONSOLE</span>
        </h1>
        <p>
          Every registered hunter — not opt-in filtered. Visible only to the
          system administrator. {rows.length} player{rows.length === 1 ? "" : "s"} ·{" "}
          {totalXp.toLocaleString()} total XP · {onLb} on leaderboard.
        </p>
      </div>

      {dbError && (
        <Window title="Database unreachable" style={{ marginBottom: 16 }}>
          <p style={{ color: "var(--rank-s, #ff5d6c)", padding: "10px 0", fontFamily: "monospace" }}>
            {dbError}
          </p>
        </Window>
      )}

      <Window title={`All players — ${rows.length}`}>
        {rows.length === 0 ? (
          <p style={{ color: "var(--muted)", padding: "14px 0" }}>
            {dbError ? "Could not load players." : "No players have registered yet."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={tableStyle}>
              <thead>
                <tr>
                  <th style={thL}>#</th>
                  <th style={thL}>Hunter / name</th>
                  <th style={thL}>Email</th>
                  <th style={thC}>Rank</th>
                  <th style={thR}>Level</th>
                  <th style={thR}>XP</th>
                  <th style={thR}>Milestones</th>
                  <th style={thL}>Awakened</th>
                  <th style={thC}>LB</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rank = rankForLevel(r.cached_level);
                  const info = emailById[r.user_id] || {};
                  const name = r.public_name || r.name || "—";
                  return (
                    <tr key={r.user_id} style={{ borderTop: "1px solid var(--line, #1b3350)" }}>
                      <td style={tdL}>{i + 1}</td>
                      <td style={tdL}>
                        <b style={{ color: "var(--ink, #e7f3ff)" }}>{name}</b>
                        {r.job && (
                          <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 12 }}>
                            {r.job}
                          </span>
                        )}
                        <div style={{ color: "var(--muted)", fontSize: 11, fontFamily: "monospace" }}>
                          {r.user_id}
                        </div>
                      </td>
                      <td style={{ ...tdL, fontFamily: "monospace", fontSize: 12 }}>
                        {info.email || <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                      <td style={thC}>
                        <b style={{ color: `var(--rank-${rank.toLowerCase()})` }}>{rank}</b>
                      </td>
                      <td style={tdR}>{r.cached_level}</td>
                      <td style={tdR}>{Number(r.cached_xp).toLocaleString()}</td>
                      <td style={tdR}>
                        {r.ms_done}/{r.ms_total}
                      </td>
                      <td style={{ ...tdL, color: "var(--muted)", fontSize: 12 }}>
                        {r.awakened ? String(r.awakened).slice(0, 10) : info.created || "—"}
                      </td>
                      <td style={thC}>
                        {r.on_leaderboard ? (
                          <span style={{ color: "var(--accent, #22d3ee)" }}>●</span>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>○</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Window>
    </>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const thBase = {
  padding: "8px 10px",
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "var(--muted)",
  fontWeight: 600,
};
const thL = { ...thBase, textAlign: "left" };
const thC = { ...thBase, textAlign: "center" };
const thR = { ...thBase, textAlign: "right" };
const tdBase = { padding: "9px 10px", color: "var(--ink, #cfe9fb)" };
const tdL = { ...tdBase, textAlign: "left" };
const tdC = { ...tdBase, textAlign: "center" };
const tdR = { ...tdBase, textAlign: "right", fontVariantNumeric: "tabular-nums" };
