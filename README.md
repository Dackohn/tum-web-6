# Dev Queue

A personal learning backlog for developers. Track articles, videos, courses, docs, and books you want to read — prioritize them, mark progress, and rate what you've finished.

Built with React + Vite. No server. All data lives in `localStorage`.

**Live demo:** https://dackohn.github.io/test/

---

## Features

- **Add resources** — title, URL, category (article / video / docs / course / book / podcast), status, tags, notes, rating
- **One-click status cycling** — click the status pill on any card to advance: Queued → In Progress → Done
- **Star / priority flag** — mark high-priority resources so they surface with the Priority filter
- **Star rating** — rate resources 1–5 when marking them Done
- **Filter** — search by title/notes/tags/URL, filter by category, status, or priority; stats bar doubles as quick status filters
- **Light / dark theme** — follows system preference, toggle persists to localStorage
- **Fully offline** — no backend, no account required

---

## Flows

### Adding a resource

1. Click **+ Add resource** in the header
2. Fill in title (required) and optionally URL, category, status, tags, notes
3. If status is **Done**, a star rating appears
4. Click **Add resource** — it appears at the top of the grid

### Tracking progress

- Click the **status pill** on a card (e.g. "Queued") to cycle it forward: Queued → In Progress → Done
- When a resource reaches Done you can edit it to add a rating and notes

### Filtering

- Use the **search box** to match title, notes, tags, or URL
- Use the **category** and **status** dropdowns to narrow down
- Click **★ Priority** to show only starred resources
- Click a number in the **stats bar** to filter by that status instantly
- **Clear filters** resets everything

### Editing / deleting

- Click **✎** on a card to open the edit form
- Click **✕** once to arm delete, again to confirm (prevents accidents)

---

## Architecture

The app uses a service layer to stay backend-agnostic:

```
src/
  api/
    storage.js          ← localStorage adapter (async interface)
    resourceService.js  ← business logic; imports the adapter
  hooks/
    useResources.js     ← React state + calls resourceService
    useTheme.js         ← light/dark toggle + persistence
  components/
    ResourceCard.jsx    ← single resource card
    ResourceForm.jsx    ← add/edit modal
    FilterBar.jsx       ← search + filter controls
  App.jsx               ← layout, filter state, derived views
```

**To add a REST backend:** create `src/api/apiAdapter.js` with the same interface as `storage.js` (`getAll`, `create`, `update`, `remove`), then change the import in `resourceService.js`. No other file needs to change.

---

## Running locally

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
# output in dist/
```

Deployed automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.
