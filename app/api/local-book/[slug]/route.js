import fs from "node:fs";
import { localFile, localShelfEnabled } from "@/lib/local-books";

export const dynamic = "force-dynamic";

// Streams a PDF from your private shelf. Returns 404 in production, so even if
// a file ever slipped into a deploy it would not be reachable.
export async function GET(_req, { params }) {
  if (!localShelfEnabled) return new Response("Not found", { status: 404 });

  const { slug } = await params;
  const file = localFile(slug);
  if (!file) return new Response("Not found", { status: 404 });

  const { size } = fs.statSync(file);
  return new Response(fs.createReadStream(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(size),
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
