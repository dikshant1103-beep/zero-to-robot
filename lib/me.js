import { auth, currentUser } from "@clerk/nextjs/server";
import { ensurePlayerData } from "./db";

// Loads (and on first visit seeds) the signed-in player's full dataset.
// Middleware already guarantees a session on /me routes.
export async function loadMe() {
  const { userId } = await auth();
  const user = await currentUser();
  const name = user?.firstName || user?.username || "Hunter";
  return ensurePlayerData(userId, name);
}
