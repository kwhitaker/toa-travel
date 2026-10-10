# Tomb of Annihilation Travelogue

A travel-day generator for the Tomb of Annihilation D&D campaign, using
[Kyle Maxwell's hex-crawl rules](https://skaldforge.wordpress.com/2017/10/02/tomb-of-annihilation-hex-crawl-procedure/).
Generate weather, travel pace, lost directions, and encounters; mark completed
days and resume the same journey when you return.

This fork runs locally. It uses **Preact for the UI, Vite for development/builds,
TypeScript, and npm**. Vite replaces Preact CLI; Preact remains the component
library. There is no backend or database.

## Local development

Use **Node 24.21.0**, pinned in both `.nvmrc` and `.node-version`:

```bash
nvm install
nvm use
npm ci
npm run dev
```

Open **http://localhost:8080**. The development server binds to localhost and
uses a fixed port so saved progress stays on the same origin between runs.
Stop it with Ctrl+C. If port 8080 is occupied, stop the other server first.

Use `npm install` when intentionally changing dependencies, and commit
`package.json` together with `package-lock.json`. Use `npm ci` for a repeatable
installation from the lockfile. The former Yarn lockfile has been removed.

## Commands and quality checks

| Command                     | Purpose                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev` / `npm start` | Start Vite with live updates.                                   |
| `npm run typecheck`         | Run strict TypeScript checks without emitting files.            |
| `npm run lint`              | Run type-aware ESLint; warnings fail the check.                 |
| `npm run lint:fix`          | Apply automatic lint fixes.                                     |
| `npm run format`            | Format source, configuration, and documentation with Prettier.  |
| `npm run format:check`      | Verify formatting without editing files.                        |
| `npm test`                  | Run the Vitest suite once.                                      |
| `npm run test:watch`        | Re-run relevant tests while editing.                            |
| `npm run test:coverage`     | Run tests with V8 coverage; HTML report is in `coverage/`.      |
| `npm run build`             | Typecheck and create a production build in `dist/`.             |
| `npm run preview`           | Serve the production build at http://localhost:4173.            |
| `npm run check`             | Check formatting, lint, tests, types, and the production build. |

Before considering a feature complete:

```bash
npm run format
npm run check
```

[GitHub Actions](.github/workflows/checks.yml) runs `npm ci` and `npm run check`
on pushes and pull requests using the pinned Node version. There is no deployment
workflow, and no AWS credentials are needed.

Vitest runs both generation/storage tests and UI tests. Preact Testing Library
renders components and checks user-visible behavior inside Vitest; these tools
work together. The suite covers original seeded results, regeneration, restored
checkmarks, legacy imports, invalid data, modals, mobile checkboxes, and storage
failures. Tests live beside the corresponding source files.

## Saved journeys

Progress stays in browser `localStorage` at **`toajourney`**, with the existing
`{ "data": { "dayCount": ..., "seed": ..., "journey": [...] } }` envelope.
The full journey is stored, including checkmarks. Changes to seed/day count and
refresh continue to preserve completed days by position.

Existing valid Lockr saves and imports remain compatible. Numeric and text seeds
retain their original meaning; the generator keeps the original dice order and
does not overwrite global `Math.random`. UUIDs change when days are regenerated.
Import and restore now validate incoming data, and imports cannot overwrite
temporary UI state. An unreadable save is preserved on initial load so it can be
recovered; explicit journey changes or a valid import replace it. If storage is
unavailable, the app still works for the current session and shows a message.

Browser storage is scoped to the origin, including hostname and port. Development
and preview therefore have separate saves. To move progress from another origin,
copy its `toajourney` value in browser DevTools and paste it into **Import Data**.

## Migration notes

- Converted application code to strict TypeScript with explicit journey,
  encounter, state, and component types. Existing visual layout and game rules
  were retained.
- Replaced the inactive Preact CLI/Webpack pipeline with Vite and its official
  Preact preset, following [the Preact maintainers' guidance](https://github.com/preactjs/preact-cli).
  Root `index.html` is the entry point; public manifest assets are in `public/`.
- Upgraded Preact within version 10 to stay compatible with the Feather icon
  library, updated UUID and Dart Sass, and retained seedrandom and Tachyons.
  Replaced the small Ramda transformations and Lockr wrapper with typed native
  JavaScript and a storage module that preserves the existing save format.
- Removed unused compatibility, Less/Stylus, and Webpack loader packages, the
  old ESLint preset, and the legacy remote analytics snippet. TypeScript stays
  on version 6 while the ESLint TypeScript integration requires it.
- Added strict type checks, ESLint flat configuration, Prettier, EditorConfig,
  Vitest/jsdom tests, optional coverage, and CI. ESLint and Prettier have separate
  responsibilities; conflicting formatting lint rules are disabled.
- Preserved the web-app manifest, icons, and production offline caching using
  `vite-plugin-pwa`. Service workers are enabled for built previews, and disabled
  in development to keep hot updates predictable. Pages are rendered in the
  browser, as the original app's entry point did not support pre-rendering.

The production CSS minifier recovers from Tachyons' obsolete Internet Explorer
`*zoom` declaration. It may print a warning while discarding this declaration;
modern-browser styling is unaffected. The existing styling library is retained.

See [architecture and data flow](docs/architecture.md) and
[contributor/agent guidance](AGENTS.md) before extending the app.

Original code by [Kevin Whitaker](https://github.com/kwhitaker/toa-travel).
Tomb of Annihilation belongs to Wizards of the Coast. Code is licensed under
[MIT](LICENSE).
