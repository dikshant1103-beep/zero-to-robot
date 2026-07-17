import { loadMe } from "@/lib/me";
import TrainingView from "@/components/views/TrainingView";

export const metadata = { title: "MY TRAINING · Zero → Robot" };

export default async function MyTraining() {
  const d = await loadMe();
  return <TrainingView courses={d.courses} editable />;
}
