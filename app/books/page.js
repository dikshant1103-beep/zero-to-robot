import books from "@/data/books.json";
import TomesView from "@/components/views/TomesView";

export const metadata = { title: "TOMES · Zero → Robot" };

export default function Tomes() {
  return <TomesView books={books} />;
}
