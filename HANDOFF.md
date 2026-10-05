# DeepSeek classroom game — Codex handoff

The user authorized publishing the source to the public GitHub repository https://github.com/lolgemola/deepseek-classroom-game. Continue in desktop Codex. Do not publish with Sites unless requested. The GitHub source repository is separate from a live game deployment.

## Current game

- Live individual strategy simulation, not a quiz or Kahoot.
- Presenter creates a room; students scan its QR code and choose company names.
- Four presenter-controlled rounds: launch, monetization, investment, final positioning.
- Each round has three choices, visible immediate trade-offs and one of two randomly selected market events. All players in a room receive the same event.
- Cash, users and trust determine the leaderboard. Bankruptcy produces a score of zero; missed decisions cost 15 cash.
- 45-second suggested presenter timer, manual reveal, final discussion prompt.
- Mobile responsive UI, durable shared state in Cloudflare D1, server-authoritative decisions and scoring. Browser storage holds only the device's room access token.

## Main files

- app/Game.tsx: presenter and player UI; QR code; polling.
- app/globals.css: dark blue responsive styles.
- app/api/game/route.ts: create/join/choose/advance/read API.
- lib/game.ts: decisions, fictional market events and scoring.
- lib/raw-db.ts: D1 binding helper.
- db/schema.ts and drizzle/: database schema and initial migration.

## Stack and setup

React 19, TypeScript, Vinext/Vite and a Cloudflare Workers backend. Use Node 22.13 or later. Run `npm ci`, then `npm run build`. Run `npm run dev` for development. The starter README contains local D1 migration instructions; apply drizzle/0000_strong_dormammu.sql once to the local DB before testing create/join.

Production needs a Worker-compatible host and shared D1 database. GitHub stores the source; GitHub Pages alone cannot run the multiplayer backend. The `.openai/hosting.json` contains a registered but unpublished Sites project ID and logical DB binding. No credentials are included. No final live deployment succeeded.

## Validation already performed

- TypeScript check and production build passed.
- Local API smoke test passed with 30 simultaneous founders and all four rounds.
- Verified hidden event responses, host authorization, duplicate choice protection, late join rejection, missed-round penalties and score arithmetic.
- Chrome UI verified room creation, generated QR, player join, choice locking and restoring a decision after refresh.
- Phone layout checked at 390 × 844.

## Useful final review before real classroom use

Test the final deployed version on two physical phones and a presenter laptop. Future event alternatives are present in the client bundle, although the selected event is hidden by the server; this is a casual classroom game rather than a tamper-resistant competition. Review scoring balance with a rehearsal. No real student information or case PDF is included in the source.

## Windows note

The system Node was v20 and the npm shim was broken during the original build. A Node 22 runtime and npm were downloaded into the previous workspace's work/ folder to build successfully. They are not part of this source. Prefer a working Node 22+ installation in the next session. Sites packaging also failed because Windows paths were passed to shell tools; the user chose to continue in desktop Codex instead.
