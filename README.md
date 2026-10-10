# Trade Desk — Personal Trading & Investment Dashboard

A single-page React app for journaling trades, tracking tasks, sizing positions and building your own
pages. No backend needed: everything is stored in your browser (localStorage + IndexedDB) and works offline.

## Features

- **Journals**: Trading, Swing Trading and Investment journals, each with:
  - Date, symbol, Long/Short, entry/exit, quantity, stop loss, target
  - P&L (₹) and P&L % calculated for you
  - Strategy/setup tag, emotion/mistake tags, notes / lesson learned
  - Multiple screenshots per entry (click to upload, drag & drop, or paste from clipboard), stored in IndexedDB, with thumbnails and a click-to-zoom lightbox
  - Search plus filters by date range, symbol and win/loss/open
  - Summary cards: Total P&L, win rate, avg win / avg loss, total trades
  - Investment journal extras: investment thesis, holding period, target price, review date
- **Pending Tasks**: priority, due date and category, with complete/edit/delete, drag-to-reorder, All/Pending/Completed filters, sort by priority or due date, and a pending count badge in the sidebar
- **Risk Calculator**: capital, risk %, entry, stop loss and side give you risk amount, position size and total investment. A target comparison table covers 1:2 to 1:5 plus a custom ratio, with a risk-vs-reward bar and **Save to Journal**, which pre-fills a new entry
- **Custom pages**: "+ Add Page" with a name and emoji icon. Build pages from Text, Checklist, Table, Image Gallery and Number Tracker blocks. Pages can be renamed, reordered (drag), duplicated and deleted
- **Settings**: light/dark theme, currency symbol (₹ by default), JSON backup export/import, clear all data
- Responsive layout: the sidebar collapses on desktop and becomes a hamburger drawer on mobile

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · lucide-react · dnd-kit · Dexie.js (IndexedDB)

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built app locally
```

The app uses hash-based routing (`/#/journals`), so `dist/` can be hosted on any static host
(GitHub Pages, Netlify, S3…) without extra rewrite rules.

## Folder structure

```
src/
├── components/        # Layout, Sidebar, Modal, Lightbox, image upload, sortable helpers
│   ├── blocks/        # Custom-page blocks (text, checklist, table, gallery, tracker)
│   └── journal/       # Journal entry form & detail view
├── context/           # Settings (theme/currency), custom pages, confirm dialog
├── db/                # Dexie (IndexedDB) schema: journal entries + images
├── hooks/             # useLocalStorage (synced across components/tabs), useImages
├── pages/             # Journals, Tasks, RiskCalculator, CustomPage, Settings
└── utils/             # P&L / risk math, formatting, backup, image helpers
```

## Where data is stored

| Data | Storage |
| --- | --- |
| Journal entries | IndexedDB (`tradeDeskDB.entries`) |
| Screenshots & gallery images (base64) | IndexedDB (`tradeDeskDB.images`) |
| Tasks, custom pages, settings, calculator inputs | localStorage (`td.*` keys) |

Data stays in the browser you use. Use **Settings → Export JSON** for regular backups, which include
images. **Import JSON** replaces the current data with the backup.
