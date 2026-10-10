# Architecture

Tomb of Annihilation Travelogue is a static, single-page Preact application written
in strict TypeScript. Vite provides development and builds. Generation and saved
progress live in the browser; there is no application server, API, database,
authentication, or router.

## Functionality

- Generate 1–365 days (79 by default) with an editable seed or a refresh button.
- Show weather, slow/fast distance, lost directions, and three encounter checks
  per day. Encounter details show creatures/counts by terrain or book references.
- Check off completed days, restore progress, and import previous-version JSON.
- Display the weather legend, encounter/import modals, and mobile day overlay.
- Roll d20 weather: 1–10 sunny, 11–15 light rain, 16–18 heavy rain, 19–20 storm.
  Row icons show the weather rules on hover, keyboard focus, or tap.

## Stack

Exact installed versions are recorded in [package-lock.json](../package-lock.json).

| Technology                              | Responsibility                                                    |
| --------------------------------------- | ----------------------------------------------------------------- |
| Node 24.21.0 / npm                      | Local tooling and repeatable dependency installation.             |
| TypeScript 6                            | Strict data, component, event, and state types.                   |
| Preact 10 / Vite 8                      | UI components and development/production builds.                  |
| seedrandom 3 / UUID 14                  | Repeatable dice rolls and independent day identifiers.            |
| Tachyons / Dart Sass / preact-feather   | Existing utility classes, custom SCSS, and button icons.          |
| ESLint / typescript-eslint / Prettier   | Type-aware linting and consistent formatting.                     |
| Vitest / jsdom / Preact Testing Library | Logic, storage, and user-interaction tests; optional V8 coverage. |

## Code and data flow

| File                                                                                                                                          | Responsibility                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [index.html](../index.html), [src/main.tsx](../src/main.tsx)                                                                                  | HTML shell, styling, and application mounting.                                           |
| [src/App.tsx](../src/App.tsx)                                                                                                                 | Application state, controls, progress, persistence lifecycle, modals, and mobile layout. |
| [src/types.ts](../src/types.ts)                                                                                                               | Shared day, encounter, seed, and saved-journey definitions.                              |
| [src/journey.ts](../src/journey.ts)                                                                                                           | Generate days using a private seeded RNG; preserve checkmarks by position.               |
| [src/jungle-encounters.json](../src/jungle-encounters.json)                                                                                   | Bundled terrain tables and creature count/special-event parameters.                      |
| [src/saved-journey.ts](../src/saved-journey.ts), [src/storage.ts](../src/storage.ts)                                                          | Validate imported/saved data and read/write browser storage.                             |
| [src/journey-day.tsx](../src/journey-day.tsx), [src/weather-key.tsx](../src/weather-key.tsx)                                                  | Travel rows and weather legend.                                                          |
| [src/weather.ts](../src/weather.ts), [src/weather-icon.tsx](../src/weather-icon.tsx)                                                          | Shared weather labels/icons/rules and accessible row tooltips.                           |
| [src/encounter-details.tsx](../src/encounter-details.tsx), [src/import-modal.tsx](../src/import-modal.tsx), [src/modal.tsx](../src/modal.tsx) | Detail tables, JSON import, and shared keyboard/focus handling.                          |
| [public/manifest.json](../public/manifest.json), [src/style/index.scss](../src/style/index.scss)                                              | Web-app metadata and custom styles.                                                      |

Actions update `App` state. Child components receive typed records/callbacks.
Generation reads bundled encounter tables and needs no remote services. The
generator retains the original dice order and numeric/text seed behavior without
changing global `Math.random`. UUIDs are fresh on regeneration.

Weather still consumes exactly one d20 roll per day; the four-category table
changes only its interpretation. Other seeded rolls remain the same. Tooltips
render into the document body to avoid clipping in the horizontally scrolling
table. Tooltip visibility and viewport position are local component state.

## Saved state

`localStorage` holds **`toajourney`**, using the original Lockr-compatible envelope:
`{ data: { dayCount, seed, journey } }`. Lockr itself is no longer needed.

Each day stores `id`, `weather`, `distance`, `lost`, `encounters`, optional
`encounterDetails`, and `hasPassed`. On mount, the app validates and restores this
snapshot directly; a missing save creates the default journey. Changes to journey
data trigger saving. Responsive layout, modal state, and error messages are not
persisted. Regeneration retains checkmarks by day index and leaves other storage
keys untouched.

Imports use the same envelope and validator. Invalid data is rejected; legacy
days missing `hasPassed` normalize to `false`. An unreadable save is preserved
on initial load while a fallback journey is shown. Explicit journey changes can
replace it. Weather values are `sunny`, `light-rain`, `heavy-rain`, and `storm`.
The validator migrates legacy `sun` (Occasional Rain) to `light-rain` and `rain`
to `heavy-rain` on load/import, preserving IDs, rolls, and progress. Saving writes
the current values, so migration is idempotent. There is no saved-format version
yet; future changes must preserve compatibility or introduce a migration.

Storage is scoped to browser profile/origin, including the port. Local development
and production preview have separate saves. Data does not sync across devices.

## Development and verification

See [README](../README.md) for commands and [AGENTS.md](../AGENTS.md) for development
conventions. [vite.config.ts](../vite.config.ts) configures Vite and Vitest.
`npm run check` verifies formatting, linting, tests, types, and the production
build. Regression tests compare the original hashes using weather labels captured
before the weather change, verifying every non-weather roll. Fixed seeds cover
all twenty weather results, alongside UI and saved-data tests.
[CI](../.github/workflows/checks.yml) runs the same checks on
Node 24.21.0. Builds produce `dist/`. `vite-plugin-pwa` preserves production offline
caching and the existing public manifest; service workers are disabled during
development. There is no deployment workflow, analytics tag, or server-side
rendering in this local setup.
