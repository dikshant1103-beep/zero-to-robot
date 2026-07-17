import courses from "@/data/courses.json";
import TrainingView from "@/components/views/TrainingView";

export const metadata = { title: "TRAINING · Zero → Robot" };

export default function Training() {
  return <TrainingView courses={courses} />;
}
