# Security review — 2026-10-17

## Deployment status
This review is of repository code, **not a completed production penetration test**. No Firebase rules or Cloud Functions were deployed by this change. Deploy the server functions **before** the tightened RTDB rules, or the multiplayer room creation/join flow will fail.

## Critical findings and fixes
1. **Room privacy**: The previous `rooms/$room/.read = auth != null` let *any* signed-in (including anonymous) user read any room if they knew/guessed its code. Changed to member-only read.
2. **Membership authorization**: The old browser created rooms and wrote `players/$uid` directly. The browser now uses `createRoom` and `joinRoom` callable Cloud Functions, which validate authenticated UID, room state, name length, room capacity and join window. All room client writes are now denied.
3. **Rate limits**: Added per-UID basic create/join throttling. This does **not** prevent a malicious user from rotating anonymous accounts; App Check and broader anti-abuse controls are still required.
4. **Private answers**: RTDB rules keep submissions and ballots unreadable from browsers; server owns grading. Verify with Firebase Emulator and real anonymous-auth test users before release.
5. **Dependency hygiene**: Added `.gitignore` for common credentials and Dependabot weekly update proposals. These are preventive, not proof no secrets have ever been committed.
6. **GitHub repository**: Currently public. A private repository can protect the Git history, but JavaScript delivered to the browser remains readable and obfuscation is not encryption. Plan a private backend repository and a static frontend publishing workflow if the account/hosting plan supports it.

## Further required work before multiplayer launch
- Configure and enforce Firebase App Check for Realtime Database and callable Functions after client integration and verification.
- Restrict the Firebase Web API key to appropriate APIs and web origins where supported; the Firebase web config is **not a service-account secret**.
- Test RTDB rules using the Firebase Emulator with members, non-members, unauthenticated clients and attempted writes. Check inherited rules and read behavior.
- Test rate limits, repeated joins, collisions, stale rooms, malicious names, race conditions, multiple tabs and host departure.
- Limit sensitive logs, sanitize names shown in UI, establish data retention and delete stale rooms/submissions/ballots.
- Add CI secret scanning (GitHub secret scanning / push protection when available, plus optional independent scanner) and branch protection.
- Review Firebase IAM: least privilege, no service account keys in source, require MFA on GitHub/Google accounts.
- Review moderation endpoints and tournament registration for abuse, bot farms and untrusted scores before publishing leaderboards.
- Configure privacy notice and account deletion policy before collecting persistent player identifiers.
- Confirm Pages deployment does not publish backend sources or credentials as static assets.

## Safe rollout order
1. Review changes and pass unit tests.
2. Deploy new `createRoom` and `joinRoom` functions.
3. Deploy the updated frontend that calls them.
4. Deploy the tightened RTDB rules.
5. Test create/join/watch and reject non-member reads in Emulator and staging.
6. Enable App Check enforcement only after client compatibility is confirmed.
7. Do not expose weekly/monthly leaderboards until scoring is server-authoritative and anti-abuse checks are in place.

## Security automation added
- `.github/workflows/codeql.yml`: CodeQL analysis on push, pull request and weekly schedule; results require a successful GitHub Actions run and supported repository security settings.
- `tests/security-rules.test.cjs` and `tests/room-security.test.cjs`: static rules and mocked callable tests; **not a substitute for RTDB Emulator authorization tests**.

## Safe static publishing prepared — requires explicit Pages settings change
- `scripts/build-public.cjs` constructs `dist/` from a strict allowlist of HTML, CSS, and browser JavaScript only. It refuses unknown local assets.
- `tests/public-bundle.test.cjs` ensures backend code, rules, CI and security documents are not in the allowlist.
- The existing tests workflow now builds the static bundle. `.github/workflows/publish-safe-pages.yml` can publish that artifact using a **manual** workflow dispatch.
- **The current GitHub Pages configuration may still publish the repository root from the main branch. Until the Pages source is changed, backend files may remain publicly accessible.** Do not assume the new workflow already protects production.
- After validating CI, open GitHub → repository Settings → Pages → Build and deployment → Source: **GitHub Actions**. Then run Actions → **Publish safe static game** → Run workflow. Verify the public URL returns 404 for `functions/index.js`, `database.secure.rules.json`, `tests/security-rules.test.cjs`, `SECURITY.md`, and `.github/workflows/tests.yml`.
- Source code previously committed to a public repository remains accessible in Git history, forks, caches and clones even after switching Pages or making the repository private. Rotate any **actual secrets** discovered in history; a Firebase Web API key is generally public configuration, not a service-account credential.
- Future architecture: move server source to a private repository with its own controlled deployment pipeline; publish only allowlisted browser assets. Do not change repository visibility before confirming hosting entitlements and a safe migration.
- No GitHub Pages settings or repository visibility were changed by this commit.
