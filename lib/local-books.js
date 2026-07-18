// Private shelf: PDFs you own, kept in books/local/ (gitignored) and served
// ONLY during local development. Nothing here is ever committed or deployed —
// in a production build every function below is inert.
//
// Drop a file named after the book, e.g.
//   books/local/a-tour-of-c-3rd-ed.pdf
// The slug must match bookSlug(title); run `npm run shelf` to see the names.

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "books", "local");

export const localShelfEnabled = process.env.NODE_ENV !== "production";

// Slugs are used in URLs and joined into a filesystem path — allow nothing else.
const SAFE_SLUG = /^[a-z0-9-]+$/;

export function localShelf() {
  if (!localShelfEnabled) return [];
  try {
    return fs
      .readdirSync(DIR)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .map((f) => f.slice(0, -4))
      .filter((s) => SAFE_SLUG.test(s));
  } catch {
    return []; // folder simply doesn't exist yet
  }
}

export function localFile(slug) {
  if (!localShelfEnabled || !SAFE_SLUG.test(slug)) return null;
  const file = path.join(DIR, `${slug}.pdf`);
  // Belt and braces: the regex already blocks traversal, but re-check the
  // resolved path really sits inside the shelf directory.
  if (!path.resolve(file).startsWith(path.resolve(DIR) + path.sep)) return null;
  return fs.existsSync(file) ? file : null;
}
