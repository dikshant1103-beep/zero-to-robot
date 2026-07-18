import { sql } from "./db";

// Total XP straight from SQL, mirroring lib/xp.js: milestone 150, course
// hours×10×progress%, chapter 30 (×1.25 when the tome is bound).
// One query instead of refetching the whole player, because this runs after
// every mutation.
async function totalXP(userId) {
  const [row] = await sql`
    SELECT (
      (SELECT COUNT(*) FROM milestones m
         JOIN phases p ON p.id = m.phase_id
        WHERE p.user_id = ${userId} AND m.done) * 150
      + (SELECT COALESCE(SUM(ROUND(hours * 10 * progress / 100.0)), 0)
           FROM courses WHERE user_id = ${userId})
      + (SELECT COALESCE(SUM(ROUND(chapters_read * 30 * (CASE WHEN owned THEN 1.25 ELSE 1 END))), 0)
           FROM books WHERE user_id = ${userId})
    )::int AS xp
  `;
  return row?.xp ?? 0;
}

export const levelFor = (xp) => 1 + Math.floor(xp / 300);

/**
 * Called after every mutation. Diffs total XP against the cached value; any
 * gain counts toward today's Daily Quest. Returns the fresh player state.
 *
 * Doing it as a diff means every XP source feeds the Daily Quest automatically
 * — no per-action bookkeeping to forget.
 */
export async function syncProgress(userId) {
  const xp = await totalXP(userId);
  const [player] = await sql`SELECT * FROM players WHERE user_id = ${userId}`;
  if (!player) return null;

  const gained = xp - player.cached_xp;
  if (gained > 0) {
    await sql`
      INSERT INTO daily_activity (user_id, day, xp)
      VALUES (${userId}, CURRENT_DATE, ${gained})
      ON CONFLICT (user_id, day) DO UPDATE SET xp = daily_activity.xp + ${gained}
    `;
  }

  await sql`
    UPDATE players SET cached_xp = ${xp}, cached_level = ${levelFor(xp)}
    WHERE user_id = ${userId}
  `;

  // Clear the Daily Quest the moment today's total crosses the target.
  const [today] = await sql`
    SELECT xp FROM daily_activity WHERE user_id = ${userId} AND day = CURRENT_DATE
  `;
  const todayXP = today?.xp ?? 0;
  const alreadyCleared =
    player.last_cleared &&
    new Date(player.last_cleared).toDateString() === new Date().toDateString();

  if (todayXP >= player.daily_target && !alreadyCleared) {
    // Consecutive day keeps the chain; any gap restarts it at 1.
    const [{ consecutive }] = await sql`
      SELECT (${player.last_cleared}::date = CURRENT_DATE - 1) AS consecutive
    `;
    const streak = consecutive ? player.streak + 1 : 1;
    await sql`
      UPDATE players
         SET streak = ${streak},
             best_streak = GREATEST(best_streak, ${streak}),
             last_cleared = CURRENT_DATE
       WHERE user_id = ${userId}
    `;
  }
  return { xp, todayXP };
}

/**
 * Daily Quest state for the UI. The stored streak is historical — a streak is
 * only *live* if the last clear was today or yesterday, so a missed day drops
 * the player into the penalty zone without a cron job running anywhere.
 */
export async function getDailyQuest(userId) {
  const [row] = await sql`
    SELECT
      p.daily_target,
      p.streak,
      p.best_streak,
      p.last_cleared::text AS last_cleared,
      COALESCE(d.xp, 0) AS today_xp,
      (p.last_cleared = CURRENT_DATE) AS cleared_today,
      (p.last_cleared >= CURRENT_DATE - 1) AS streak_alive,
      (CURRENT_DATE - p.last_cleared) AS days_missed
    FROM players p
    LEFT JOIN daily_activity d
      ON d.user_id = p.user_id AND d.day = CURRENT_DATE
    WHERE p.user_id = ${userId}
  `;
  if (!row) return null;

  const streakAlive = !!row.streak_alive;
  return {
    target: row.daily_target,
    todayXP: row.today_xp,
    clearedToday: !!row.cleared_today,
    streak: streakAlive ? row.streak : 0,
    bestStreak: row.best_streak,
    // Penalty only applies once they've actually started — a brand-new player
    // who has never cleared a day isn't "failing", they just haven't begun.
    penalty: !streakAlive && row.last_cleared !== null,
    daysMissed: row.days_missed ?? 0,
    pct: Math.min(100, Math.round((row.today_xp / row.daily_target) * 100)),
  };
}

export async function setDailyTarget(userId, target) {
  await sql`UPDATE players SET daily_target = ${target} WHERE user_id = ${userId}`;
}
