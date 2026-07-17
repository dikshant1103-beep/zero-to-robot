import log from "@/data/log.json";
import RaidLogView from "@/components/views/RaidLogView";

export const metadata = { title: "RAID LOG · Zero → Robot" };

export default function RaidLog() {
  return <RaidLogView log={log} />;
}
