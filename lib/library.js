// Reading sources for the tome catalogue, keyed by exact book title.
//
// `read` entries are ONLY books the authors/publishers themselves put online for
// free. Nothing here is a scanned or pirated copy — for the commercial titles we
// link where to buy or borrow instead. Keep it that way: this site is public.
//
// embeddable=false means the source is http-only or blocks framing, so the
// reader page opens it in a new tab instead of inlining it.

export const LIBRARY = {
  "Modern Robotics: Mechanics, Planning, and Control": {
    kind: "pdf",
    url: "https://hades.mech.northwestern.edu/images/7/7f/MR.pdf",
    embeddable: true,
    source: "Northwestern University — the authors' official free PDF",
  },
  "Feedback Systems: An Introduction (2nd ed)": {
    kind: "pdf",
    url: "http://www.cds.caltech.edu/~murray/books/AM08/pdf/fbs-public_24Jul2020.pdf",
    embeddable: false,
    source: "Caltech — Murray's official public PDF (http-only host)",
  },
  "Reinforcement Learning: An Introduction (2nd ed)": {
    kind: "pdf",
    url: "http://incompleteideas.net/book/RLbook2020.pdf",
    embeddable: false,
    source: "Sutton's official site — full 2nd edition, 73 MB (http-only host)",
  },
  "Underactuated Robotics": {
    kind: "web",
    url: "https://underactuated.mit.edu",
    embeddable: true,
    source: "MIT — Tedrake's free course book, updated every term",
  },
  "Deep Learning": {
    kind: "web",
    url: "https://www.deeplearningbook.org",
    embeddable: true,
    source: "The authors' free online edition (MIT Press)",
  },
  "Small Unmanned Aircraft: Theory and Practice": {
    kind: "drive",
    url: "https://drive.google.com/file/d/10iq7L_kAAdkjCFoq4EBRaT1u212BbyJ7/view",
    embed: "https://drive.google.com/file/d/10iq7L_kAAdkjCFoq4EBRaT1u212BbyJ7/preview",
    embeddable: true,
    source: "Beard & McLain's in-progress 2nd edition, released free by the authors",
  },

  // Commercial titles — buy or borrow, nothing hosted here.
  "A Tour of C++ (3rd ed)": {
    buy: "https://www.informit.com/store/tour-of-c-plus-plus-9780136816484",
    borrow: "https://openlibrary.org/search?q=A+Tour+of+C%2B%2B+Stroustrup",
  },
  "Practical Electronics for Inventors (4th ed)": {
    buy: "https://www.mhprofessional.com/practical-electronics-for-inventors-fourth-edition-9781259587542-usa",
    borrow: "https://openlibrary.org/search?q=Practical+Electronics+for+Inventors",
  },
  "Making Embedded Systems (2nd ed)": {
    buy: "https://www.google.com/search?tbm=bks&q=9781098151539",
    borrow: "https://openlibrary.org/search?q=Making+Embedded+Systems+Elecia+White",
  },
  "Probabilistic Robotics": {
    buy: "https://www.google.com/search?tbm=bks&q=9780262201629",
    borrow: "https://openlibrary.org/search?q=Probabilistic+Robotics+Thrun",
  },
  "Hands-On Machine Learning (3rd ed)": {
    buy: "https://www.google.com/search?tbm=bks&q=9781098125967",
    borrow: "https://openlibrary.org/search?q=Hands-On+Machine+Learning+G%C3%A9ron",
  },
  "The Art of Electronics (3rd ed)": {
    buy: "https://www.google.com/search?tbm=bks&q=9780521809269",
    borrow: "https://openlibrary.org/search?q=The+Art+of+Electronics+Horowitz",
  },
  "Introduction to Autonomous Mobile Robots (2nd ed)": {
    buy: "https://www.google.com/search?tbm=bks&q=9780262015356",
    borrow: "https://openlibrary.org/search?q=Introduction+to+Autonomous+Mobile+Robots",
  },
};

export function bookSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function librarySource(title) {
  return LIBRARY[title] || null;
}

// Slug -> { title, ...entry }, so the reader route can resolve a URL segment.
export function findBySlug(slug) {
  for (const [title, entry] of Object.entries(LIBRARY)) {
    if (bookSlug(title) === slug && entry.url) return { title, ...entry };
  }
  return null;
}

export function readableSlugs() {
  return Object.entries(LIBRARY)
    .filter(([, e]) => e.url)
    .map(([title]) => bookSlug(title));
}
