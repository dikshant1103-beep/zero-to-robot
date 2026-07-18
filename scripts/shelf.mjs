// `npm run shelf` — prints the filename each book needs in books/local/,
// and whether that file is present. Dev convenience only.
import fs from "node:fs";
import path from "node:path";

const books = JSON.parse(fs.readFileSync("data/books.json", "utf8")).books;
const DIR = path.join("books", "local");

// Mirrors bookSlug() in lib/library.js — keep the two in step.
const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const present = new Set(
  (fs.existsSync(DIR) ? fs.readdirSync(DIR) : [])
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((f) => f.slice(0, -4))
);

console.log(`\n  Private shelf — ${DIR}/  (gitignored, never deployed)\n`);
for (const b of books) {
  const slug = slugify(b.title);
  console.log(`  ${present.has(slug) ? "✓" : "·"}  ${slug}.pdf`);
  console.log(`     ${b.title} — ${b.authors}\n`);
}
console.log(`  ${present.size} of ${books.length} on the shelf.\n`);
