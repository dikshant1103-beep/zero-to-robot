import { loadMe } from "@/lib/me";
import TomesView from "@/components/views/TomesView";
import { localShelf } from "@/lib/local-books";

export const metadata = { title: "MY TOMES · Zero → Robot" };

export default async function MyTomes() {
  const d = await loadMe();
  return <TomesView books={d.books} editable local={localShelf()} />;
}
