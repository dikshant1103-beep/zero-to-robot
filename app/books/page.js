import books from "@/data/books.json";
import TomesView from "@/components/views/TomesView";
import { localShelf } from "@/lib/local-books";

export const metadata = { title: "TOMES · Zero → Robot" };

export default function Tomes() {
  return <TomesView books={books} local={localShelf()} />;
}
