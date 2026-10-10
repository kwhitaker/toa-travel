# Working in this repository

## Scope and setup

This is a small local Preact/TypeScript application built with Vite. Preserve
the existing travelogue UI and game rules unless the task explicitly changes
them. There is no backend, database, or deployment workflow.

Read `README.md`, `docs/architecture.md`, and the affected modules before editing.
Use Node **24.21.0** (`nvm use`) and **npm**. Install with `npm ci`. Keep `.nvmrc`,
`.node-version`, package engine requirements, and CI aligned when changing Node.
Use `npm install` for dependency updates and commit the npm lockfile; do not add
another package manager's lockfile. Choose compatible maintained versions rather
than forcing incompatible peer dependencies.

## Code and data conventions

- Use `.ts` for logic and `.tsx` for JSX. Keep strict TypeScript checks enabled.
  Model data explicitly, prefer inference locally, and use type-only imports.
  Accept untrusted JSON as `unknown` and validate it before use. Avoid `any`,
  unchecked casts, and disabling lint/type checks to bypass errors.
- Keep generation in `src/journey.ts`, data definitions in `src/types.ts`, saved
  data validation in `src/saved-journey.ts`, and browser persistence in
  `src/storage.ts`. Components should render data and handle interaction.
- Preserve numeric-vs-text seed semantics and the exact dice-call order. Use a
  private seeded RNG; never replace global `Math.random`. The original generator
  hashes in `src/test/fixtures/legacy-journeys.json` are compatibility fixtures,
  captured before the refactor. Do not regenerate them to hide a regression.
- Preserve the `toajourney` storage key and `{ data: SavedJourney }` envelope.
  Checkmarks carry forward by day index during regeneration. UI-only state is
  never persisted. Do not clear unrelated browser storage. Saved-format changes
  need a compatibility/migration strategy and regression tests.
- Use native array/object operations for small transformations. Add dependencies
  when they solve a concrete problem. Keep changes scoped to the requested work;
  retain existing styles, assets, and attribution.
- Use semantic controls, accessible names, and keyboard interaction. Give mapped
  records stable keys; avoid duplicate DOM IDs in the mobile overlay. Clean up
  event listeners and other side effects when components unmount.
- Keep browser-only code out of the generator and validators. Keep modules easy
  to test without launching the app. Report storage failures without breaking
  the active journey.

## Tests and completion checks

Add or update meaningful tests when changing behavior. Cover the user-visible
outcome and important failure paths rather than private implementation details.
Use Vitest for unit tests and Preact Testing Library/user-event for UI tests.
Keep tests deterministic, reset mocks/storage, and await asynchronous UI updates.
For generator changes, check fixed-seed results; for persistence changes, check
legacy data and reload behavior. Test files live beside the source they cover.

While working, run the relevant tests (`npm test -- src/journey.test.ts`, for
example). Format changes with `npm run format` and review the diff for unrelated
edits and generated artifacts. Before claiming a task is complete, run:

```bash
nvm use
npm run check
```

This runs formatting checks, type-aware linting, all tests, type checking, and the
production build. All must pass. `npm run test:coverage` provides an optional
report for identifying important untested behavior. Do not commit `dist/`,
`coverage/`, or `node_modules/`. For visual/interaction changes, also inspect the
app at desktop and mobile widths with `npm run dev` when a browser is available.

Update README/architecture documentation when commands, dependencies, data flow,
or saved formats change. Report what changed and the actual validation results.
If a check cannot run, explain the specific blocker and do not claim it passed.
