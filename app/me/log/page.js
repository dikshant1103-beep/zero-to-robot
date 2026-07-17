import { loadMe } from "@/lib/me";
import RaidLogView from "@/components/views/RaidLogView";

export const metadata = { title: "MY RAID LOG · Zero → Robot" };

export default async function MyRaidLog() {
  const d = await loadMe();
  return <RaidLogView log={d.log} editable />;
}
