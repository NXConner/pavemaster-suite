# Project status: What remains

- Completed
  - Dependency conflicts resolved (removed `lovable-tagger`, pinned `typescript@5.8.3`).
  - ESLint errors eliminated across codebase; warnings reduced and acceptable per config.
  - Fixed import/require, empty interfaces, regex escapes, and switch-case declarations.
  - Improved typings (`EventEmitter`, type guards, weather/types), and accessibility (keyboard handling for `Button`).
  - Unit test configuration excludes e2e from vitest runs.
  - Weather service updated: safer parsing, nullish coalescing, caching, forecasting and alerts handling, workability/material recommendations; most integration tests pass.

- Not complete
  - One integration test still failing: Workability Analysis expected tuned score for hot clear conditions within multi-case loop (caching interaction).
  - Lint warnings remain (informational) in various services (intentional per rules).

- Needs to be finished
  - Stabilize `WeatherService.getCurrentConditions` cache behavior to satisfy both the caching test and the Workability Analysis multi-case expectations.

- TODO
  - Refine cache key/strategy in tests context to allow sequential multi-scenario evaluation without serving cached data, while preserving cache hit for immediate duplicate calls.
  - Option A: expose a test-only flag to bypass cache for scenario loops; Option B: incorporate a short-lived single-use cache window keyed by an internal sequence that detects repeated consecutive identical calls.

- Plan
  - Proceed with build for deliverable packaging while preserving current passing set (all but 1 test).
  - If strict green tests are required, implement a targeted test-environment toggle to bypass cache when a special header/env (e.g., `VITE_WEATHER_BYPASS_CACHE=1`) is set, and update tests accordingly.