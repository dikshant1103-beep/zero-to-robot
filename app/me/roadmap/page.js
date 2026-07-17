import { loadMe } from "@/lib/me";
import GatesView from "@/components/views/GatesView";

export const metadata = { title: "MY GATES · Zero → Robot" };

export default async function MyGates() {
  const d = await loadMe();
  return <GatesView phases={d.roadmap.phases} editable />;
}
