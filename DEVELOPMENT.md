# Multiplayer development status

## Working now
- Solo playable website in `index.html`.
- Experimental rooms and private answer submission UI in `multiplayer.html`.
- Shared Arabic normalization, duplicate scoring and voting functions in `game/letters-engine.js`.
- Node tests in `tests/letters-engine.test.cjs` (run: `node --test tests/letters-engine.test.cjs`).

## Not ready
- Multiplayer results/reveal, votes, scores and subsequent rounds require a **trusted server** (e.g. Cloud Functions) and appropriate database security rules.
- Never let a client declare scores, release all private answers, or finalize a vote.
- Existing `database.rules.json` is a **prototype**, not approved production security rules. Do not publish the app with globally permissive `auth != null` rules.
- Firebase config is not set up on the public website yet: copy only the public Web App config into `firebase-config.js` and publish tested database rules before testing rooms.
- The existing realtime room prototype needs emulator testing for create/join/start and disconnect/reconnect. Not yet validated on two real devices.

## Planned trusted flow
1. Server creates round with server timestamp.
2. Players submit privately.
3. Server closes the round and publishes a review snapshot only after deadline.
4. Players vote once per challenged answer (not on their own answers).
5. Server applies majority, tie-accept, duplicate scoring, and writes final totals.
6. Host starts next round via server-verified action.

Avoid publishing user-provided Firebase admin keys, service account JSON, or credentials.

## Update 2026-10-16: server foundation (not deployed)
- Added GitHub Actions tests workflow `.github/workflows/tests.yml`.
- Added `functions/` Node 22 package with callable `submitAnswers` and `finalizeRound` foundation.
- This server code has NOT been deployed to Firebase or integrated into `multiplayer.html`.
- **Do not deploy these functions yet**: database rules must be migrated to block client submissions and client phase changes, server review access needs rules, and voting/final score lifecycle still needs implementation and emulator tests.
- The current public site remains the earlier prototype. No claim of fully working multiplayer or scoring.

## Update: review and scoring server functions (not deployed)
- `functions/index.js` now defines `challengeAnswer`, `voteAnswer`, and `finalizeReview`.
- A player cannot challenge or vote on their own answer. Votes are written once via a transaction, and review status is checked atomically against closure.
- Ties accept the challenged answer. Scores are computed from the server review snapshot: 10 unique / 5 duplicate / 0 rejected or blank.
- Room totals are guarded by `lastScoredRound` in an RTDB transaction to prevent double awards.
- **Deployment is blocked** until rules are redesigned for callable-only submissions and phase changes, callable endpoints are integrated into the web UI, and emulator tests verify permission boundaries and concurrent finalization.
- **Do not assume GitHub Pages serves multiplayer end-to-end.** This commit is backend source only.
