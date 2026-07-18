import Link from "next/link";
import { notFound } from "next/navigation";
import { findBySlug, readableSlugs } from "@/lib/library";

export function generateStaticParams() {
  return readableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const book = findBySlug(slug);
  return { title: book ? `${book.title} — Tome Reader` : "Tome Reader" };
}

export default async function ReadPage({ params }) {
  const { slug } = await params;
  const book = findBySlug(slug);
  if (!book) notFound();

  const embedSrc = book.embed || book.url;

  return (
    <div className="reader">
      <div className="reader-bar">
        <Link href="/books" className="sys-btn ghost">
          ← TOMES
        </Link>
        <div className="reader-title">
          <span>「{book.title}」</span>
          <small>{book.source}</small>
        </div>
        <div className="sys-row">
          <a className="sys-btn ghost" href={book.url} target="_blank" rel="noreferrer">
            OPEN ↗
          </a>
          {book.kind === "pdf" && (
            <a className="sys-btn" href={book.url} download target="_blank" rel="noreferrer">
              DOWNLOAD
            </a>
          )}
        </div>
      </div>

      {book.embeddable ? (
        <iframe className="reader-frame" src={embedSrc} title={book.title} />
      ) : (
        <div className="reader-fallback">
          <p className="mono">SOURCE NOT EMBEDDABLE</p>
          <p>
            This tome is hosted on an http-only university server, so browsers refuse
            to display it inside a secure page. It opens fine in its own tab.
          </p>
          <div className="sys-row" style={{ justifyContent: "center" }}>
            <a className="sys-btn big" href={book.url} target="_blank" rel="noreferrer">
              OPEN TOME ↗
            </a>
          </div>
          <p className="src">{book.source}</p>
        </div>
      )}
    </div>
  );
}
