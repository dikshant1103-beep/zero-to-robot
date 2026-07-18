import { auth, currentUser } from "@clerk/nextjs/server";
import { ensurePlayerData } from "./db";
import { getDailyQuest, syncProgress } from "./progress";

// Loads (and on first visit seeds) the signed-in player's full dataset.
// Middleware already guarantees a session on /me routes.
export async function loadMe() {
  const { userId } = await auth();
  const user = await currentUser();
  const name = user?.firstName || user?.username || "Hunter";
  const data = await ensurePlayerData(userId, name);
  // A fresh player has no cached XP yet; sync so the Daily Quest reads right
  // on the very first page view rather than after the first edit.
  await syncProgress(userId);
  return { ...data, daily: await getDailyQuest(userId) };
}
