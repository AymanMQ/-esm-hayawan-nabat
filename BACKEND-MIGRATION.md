# Private Firebase backend migration — safety checklist

Status: **planning only**. This document does not move, deploy, or delete code.

## Current split
- Public Pages artifact: built from an explicit allowlist in `scripts/build-public.cjs`.
- Backend currently tracked publicly: `functions/index.js`, `functions/rooms.js`, `functions/literary.js`, `functions/tournaments.js`, `functions/lib/`, `functions/package.json`.
- Shared logic exists under both `game/` and `functions/lib/`; identify and test the intended canonical implementation before changing imports.
- `firebase.json` currently selects `database.secure.rules.json`, but this does **not** mean those rules are live.
- Pages publishing uses `.github/workflows/publish-safe-pages.yml` and must remain restricted to `dist/`.

## Safe sequence — do not skip gates
1. Create a **private** GitHub repository under the owner account, e.g. `esm-hayawan-nabat-backend`; grant only necessary maintainers access. The private repository's creation and access must be independently confirmed.
2. Copy the existing server source and a pinned dependency lockfile to the private repository, **without deleting the public original yet**. Verify no credentials or service-account JSON files are in the code or Git history. Previously public code cannot be made secret retroactively.
3. Set up a dedicated private-repository workflow and limited deploy identity for Firebase Cloud Functions. Keep Firebase project identifiers/configuration documented; store actual deploy credentials only in an authorized secret store. Prefer short-lived OIDC federation where supported.
4. Run Node syntax/tests and Firebase Emulator integration tests for create/join, non-member reads, writes, submissions, ballots, vote races, and concurrent finalization. Include two anonymous authenticated test users.
5. Deploy Cloud Functions to **staging** first. Verify endpoints, region, authentication and callable compatibility with the currently published frontend. Test with two devices/browsers.
6. Deploy compatible frontend to a preview; only then consider gradual production release. **Do not activate restrictive database rules before confirming the callable functions are deployed and reachable.**
7. Deploy `database.secure.rules.json` to staging; exercise allow/deny matrix using the emulator and staging. Enable App Check enforcement only after successful client validation.
8. After a monitored production migration and rollback rehearsal, remove backend sources from the public repository through a separate, reviewed PR. Update CI so browser tests do not require absent private source files. Preserve static publishing and its allowlist.
9. Audit Firebase IAM, GitHub Actions permissions and runtime logs; rotate **real secrets** exposed in any public history. Do not treat the public Firebase web config as a service account key.

## Production release / rollback
- Before release: record currently deployed functions, live RTDB rules and current Pages artifact, and make restorable backups as appropriate.
- Roll back frontend, functions and rules as a **compatible set** if create/join or authorization checks fail. Do not blindly restore legacy permissive rules as a normal rollback strategy.
- Never delete production rooms or data in migration testing.

## Ranking release gate
- `game/ranking-periods.js` already defines Saudi weekly/monthly boundaries (Sunday 00:00 Asia/Riyadh for weeks); `tests/ranking-periods.test.cjs` tests these boundaries.
- Period calculations alone are **not** a leaderboard. Production rankings require server-authoritative immutable scoring events, period-specific aggregation, abuse prevention, access controls and retention policies.
- Validate week boundaries at 2026-10-17 20:59:59 UTC vs 21:00:00 UTC, and month rollovers. Keep display timezone Asia/Riyadh; do not trust client clocks for score attribution.
