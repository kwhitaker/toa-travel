# Architecture

Tomb of Annihilation Travelogue is a static, single-page D&D travel generator written in JavaScript/JSX with Preact. Generation and saved progress live in the browser. There is no application backend, API, database, authentication, or router.

## Functionality

- Generate 1–365 days (79 by default) from an editable seed, or choose a new seed with the refresh button.
- Show weather, slow/fast travel distance, directions if lost, and three encounter checks per day. Encounter details list creatures/counts by terrain or refer to the campaign book.
- Check off completed days, automatically restore progress, and import previous-version JSON. Includes a weather legend and mobile layout; no export UI.

## Technologies and libraries

Dependencies: [package.json](../package.json). Resolved versions: [yarn.lock](../yarn.lock).

| Technology | Use |
| --- | --- |
| Preact 10.11.2 | Components, class-based app state, and import-modal hooks. |
| Ramda 0.28.0 | Functional generation pipelines and immutable state transformations. |
| seedrandom 3.0.5 | Seeded dice rolls, installed globally as `Math.random`. |
| uuid 9.0.0 | UUID v4 identifiers for individual days. |
| Lockr 0.9.0-beta.0 | JSON persistence through browser `localStorage`. |
| Tachyons 4.12.0, preact-feather 4.2.1 | Utility CSS and button icons, alongside bundled SVG/image assets. |
| Preact CLI 3.4.1 | Development/build tooling using Webpack 4 and Babel. |
| Dart Sass (`sass`) 1.89.2, sass-loader 10.3.1 | Custom SCSS compilation; Sass is pinned for Node 16 compatibility. |
| ESLint 8.26.0, eslint-config-synacor | Linting. |

`preact-compat` 3.19.0 is declared but not imported by application source. Less/Stylus tooling is declared without corresponding source styles. There is no TypeScript.

## Code layout and data flow

| File | Responsibility |
| --- | --- |
| [src/index.js](../src/index.js) | Set the Lockr storage prefix and mount `App`. |
| [src/App.js](../src/App.js) | Own state, persistence, generation controls, checkmarks, modals, and mobile layout. |
| [src/journey.js](../src/journey.js) | Generate day records: weather, pace, lost directions, encounters, and encounter details. |
| [src/jungle-encounters.json](../src/jungle-encounters.json) | Bundled encounter tables by terrain and creature count/special-event definitions. |
| [src/journey-day.js](../src/journey-day.js), [src/weather-key.js](../src/weather-key.js) | Render travel rows and the weather legend. |
| [src/encounter-details.js](../src/encounter-details.js), [src/import-modal.js](../src/import-modal.js) | Encounter overlay and JSON import form. |
| [src/style/index.scss](../src/style/index.scss), [src/template.html](../src/template.html), [src/manifest.json](../src/manifest.json) | Custom styling, HTML shell, and web-app metadata/icons. |

Actions update `App` state; child components receive records and callbacks. Generation seeds the random number generator, creates day records, and looks up encounters in bundled JSON. Weather and encounters require no remote services.

## Saved state

**Journey state uses `localStorage`, not cookies.** Lockr has prefix `toa` and logical key `journey`.

- Saves `{ dayCount, seed, journey }`, including every day's `id`, `weather`, `distance`, `lost`, `encounters`, optional `encounterDetails`, and `hasPassed` checkbox flag.
- On mount, restores the full snapshot without regenerating. If absent, generates the default journey with a new seed.
- Saves after component updates, excluding temporary `isMobile`, `visibleDetails`, and `showImport` fields.
- Changing day count or seed—including refresh—regenerates days but preserves checkmarks by **day index**. Refresh calls `Lockr.flush()` before saving the replacement.
- Storage is per browser profile/site origin, with no device or domain sync. Clearing site storage removes progress.

Import expects `{ "data": { "seed": ..., "dayCount": ..., "journey": [...] } }`. The inner object merges into app state and is saved normally.

## Development and deployment

[.node-version](../.node-version) pins Node 16.17.0 (package minimum: 16.17.0). Run `yarn` to install, `yarn dev` to develop, and `yarn build` to generate `build/`. `yarn test` invokes ESLint and `preact test`; no test files are committed.

[.github/workflows/s3-deploy.yml](../.github/workflows/s3-deploy.yml) configures `master` pushes to build and deploy to S3, invalidate CloudFront, and use repository secrets. [preact.config.js](../preact.config.js) sets the production asset path from the manifest's `start_url` (`/`). The HTML template includes a legacy Google Analytics tag, separate from journey storage.

## Notes for future features

- Extend rules in `journey.js`, encounter tables in JSON, and UI/state in `App` and its children. Identical seed values/types reproduce rolls with unchanged code/data; UUIDs are regenerated. Seeding replaces global `Math.random`.
- Saved state has no schema version, migrations, or restore validation. Import validation also needs repair: `validateDay` reverses Ramda's `has` arguments and unconditionally sets `isValid = true`, overriding its checks.
