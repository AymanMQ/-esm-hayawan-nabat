# اسم حيوان نبات — Multiplayer prototype

The original solo game remains at `index.html`. A new multiplayer prototype is available at `multiplayer.html`.

## Before multiplayer can work

1. In the existing Firebase project, add a **Web App** (if not already added) and copy its public browser configuration to `firebase-config.js`. Keep the file limited to Firebase Web App public config; **never** put service account keys or admin secrets there.
2. Enable Firebase Authentication **Anonymous**.
3. Open Firebase **Realtime Database → Rules**. Review and publish the rules in `database.rules.json` (replace the previous overly broad authenticated-user rules). Back up existing rules first.
4. Verify the `databaseURL` matches the existing database region.
5. Wait for GitHub Pages deployment, then visit `/multiplayer.html` on two browsers. Each user enters a different nickname. One creates a room, the other joins with the 6-character code, then the host starts a 90-second round.

## What is implemented
- Anonymous Firebase login; nickname stored locally.
- Room creation, 6-character code, joining and shared player list.
- Host-only start control.
- Synchronized letter and round deadline.
- Private submissions under `submissions/{room}/{round}/{uid}` with rules limiting reads to the author.

## What is NOT yet implemented
- Server-driven round close, reveal, votes, validation, scoring, repeat rounds, host migration, production anti-cheat, full integration testing.
- Current room rules allow authenticated clients to read room metadata if they know the room code; **do not store private answers in room metadata**.
- The prototype is not production-ready and has not been tested end-to-end on two devices.

## Security
`firebase-config.js` contains public identifiers only; real protection comes from database rules. Never use the earlier `auth != null` global read/write rule in production. The rules here are a starting point and need emulator tests and security review.
