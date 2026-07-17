import roadmap from "@/data/roadmap.json";
import GatesView from "@/components/views/GatesView";

export const metadata = { title: "GATES · Zero → Robot" };

export default function Gates() {
  return <GatesView phases={roadmap.phases} />;
}
