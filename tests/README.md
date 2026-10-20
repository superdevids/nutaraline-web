# Tests

## Run

```bash
npm test          # single run
npm run test:watch
npm run typecheck
```

## Layout

- `tests/setup.ts` — jsdom shims (`matchMedia`, `ResizeObserver`) and cleanup
- `tests/stubs/server-only.ts` — alias target so `import "server-only"` does not throw
- `tests/helpers/` — shared render helper and assertions
- `tests/**/*.test.ts(x)` — test files

## Conventions

Name files after the module under test, e.g. `lib/api-key.test.ts`.
These tests target the acceptance criteria in `docs/PRD.md` §6, not a coverage
number. If a test does not map to an AC, question whether it belongs here.

## Note

Pages are Server Components that read `next/root-params`; they are not mounted
in jsdom. Logic is tested at the `lib/` layer, and pages are verified with a
production build plus a manual pass.
