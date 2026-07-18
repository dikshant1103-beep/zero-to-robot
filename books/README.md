# Private shelf

Put PDFs **you own** in `books/local/`. That folder is gitignored and the
route that serves it returns 404 in production, so nothing here is ever
committed or deployed — it is your machine only.

Run `npm run shelf` to see the exact filename each book needs, then:

    cp ~/Downloads/whatever.pdf books/local/a-tour-of-c-3rd-ed.pdf

Restart `npm run dev` and the tome shows a **READ / DOWNLOAD / MY COPY**
row on the TOMES page, reading in the same viewer as the free books.

Books whose authors publish them free are listed in `lib/library.js` and
need nothing here.
