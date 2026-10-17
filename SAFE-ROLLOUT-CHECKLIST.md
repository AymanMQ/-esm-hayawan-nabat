# Safe rollout checklist — multiplayer backend and leaderboards

This document is a deployment gate, not a claim that production Firebase has been changed. All work should be validated in a separate Firebase staging project first. Do not merge backend deployment changes into the public GitHub Pages workflow.

## Current repository facts (2026-10-18)
- `firebase.json` targets `database.secure.rules.json`.
- The secure rules deny all client writes to room, submission and vote paths; only privileged server SDK actions can write.
- Therefore deploying the secure rules before working callable Functions and the compatible browser client will break multiplayer.
- The public Pages workflow publishes a strict `dist/` allowlist; do not add `functions/**` or credential files to it.
- The static client can remain public; backend business logic and service credentials must not be shipped with it.

## 1. Private backend extraction (no production changes)
- [ ] Create a **private** repository under the intended owner. Confirm visibility before copying server code.
- [ ] Copy reviewed `functions/**` source and a dedicated backend `firebase.json` to that private repository on a working branch.
- [ ] Do not copy Git history, `.env`, `node_modules`, service-account keys or private credentials.
- [ ] Add secret scanning and CI test/lint for the private repository; use short-lived federated credentials where supported.
- [ ] Configure staging Firebase project ID and CI permissions separately from production.
- [ ] Verify Cloud Functions deploy from the private repository to staging.
- [ ] Only after that, propose removing server source from the public repository, while acknowledging it remains available in historical public commits. Rotate any *actual* leaked credentials.

## 2. Firebase staging test matrix (required before production)
- [ ] Anonymous sign-in can create and join rooms through callables (two distinct users/browsers).
- [ ] Non-member cannot read a room; signed-out user cannot read it.
- [ ] Member can read the appropriate room state; room codes are unguessable enough to resist enumeration.
- [ ] Client cannot alter host, phase, round, score or other protected fields directly.
- [ ] Client cannot read another user's private submission, votes or hidden answers.
- [ ] Round transitions, retries, duplicate submissions, disconnect/rejoin and host departure work.
- [ ] Function rate limits and input validation reject malformed or abusive requests.
- [ ] Rules tests use Firebase Emulator with actual authenticated identities (static tests alone are insufficient).
- [ ] Test App Check integration and observe metrics before enabling enforcement.
- [ ] Verify logs do not store answer contents or unnecessary persistent identifiers.

## 3. Production deployment sequence (manual sign-off)
1. Record current production rules, deployed Function versions, site version and rollback commands.
2. Deploy compatible callable Functions first; confirm they work under current rules.
3. Deploy the client to staging; complete two-device multiplayer end-to-end checks.
4. Publish the compatible frontend using the existing Pages allowlist workflow after tests pass.
5. Apply secure RTDB rules only after the production callable path is verified. Test member/non-member authorization immediately.
6. Roll back the last failing change if room create/join or private access tests fail. Never relax rules to open read/write as a quick fix.
7. Enable App Check enforcement only after confirming legitimate clients are passing.

## 4. Weekly/monthly leaderboard requirements (not yet deployed)
- Only server-authoritative scores qualify. Do not rank client-submitted totals.
- Store immutable leaderboard entries with stable user ID, game ID, score, server timestamp and deterministic period keys.
- Week starts **Sunday 00:00 Asia/Riyadh (UTC+03:00)**; month starts on local day 1 at 00:00.
- Convert server timestamps to `Asia/Riyadh` *before* calculating week/month grouping; never use browser-local timezone or an ISO Monday week.
- Boundary cases for staging: Saturday 23:59:59 Saudi belongs to prior week; Sunday 00:00:00 belongs to new week. Last day of month 23:59:59 belongs to old month; day 1 00:00:00 belongs to new month.
- Define tie-breaker (e.g. higher score, then earlier verified completion, then stable UID), pagination, abuse controls, deletion policy and maximum entries.
- Add deterministic UTC timestamp tests for boundary transitions before publishing a leaderboard UI.

## 5. Release acceptance
- [ ] All unit/security checks green.
- [ ] Firebase Emulator access tests green.
- [ ] Two-device multiplayer smoke test green.
- [ ] Pages returns 404 for backend files and RTDB rules.
- [ ] Production rollback steps are documented and tested.
- [ ] Owner reviews and approves release; default `main` remains unchanged until approval.
