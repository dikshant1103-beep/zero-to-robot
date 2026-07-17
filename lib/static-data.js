import roadmap from "@/data/roadmap.json";
import courses from "@/data/courses.json";
import books from "@/data/books.json";
import log from "@/data/log.json";
import { getSystem } from "./xp";

export const staticData = { roadmap, courses, books, log };

export function getStaticSystem() {
  return getSystem(staticData);
}
