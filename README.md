# DeepSeek classroom game

A live strategy simulation inspired by the DeepSeek case. A presenter creates a room, students scan its QR code and name fictional AI companies, and everyone plays four rounds together.

## Playing

1. On the presenter laptop, select **Host a new game**.
2. Students scan the QR code or enter the room code. Start once everyone has joined; late joining is closed.
3. Open each round: launch, monetization, investment, then final positioning. Each founder locks one of three strategies. Immediate trade-offs are visible; the selected market event stays hidden until reveal.
4. Use the suggested 45-second timer, then manually close choices and reveal the shared event. The timer does not close the round automatically.
5. Discuss the result and advance. Finish with the leaderboard and discussion prompt.

Companies start with 100 cash, 50 users and 50 trust. Score is cash + users + trust. Cash at zero or below means bankruptcy and a zero score; missed choices cost 15 cash. Trust stays between 0 and 100; users cannot fall below zero. Ties use remaining cash, then share a rank.

Keep the presenter session on its original device. Browser storage holds a room access token so refreshing restores the session. Clearing storage loses access. The QR link contains only the room code.

## Local setup

Requires Node.js **22.13 or later** and npm. Uses React 19, TypeScript, Vinext/Vite, Cloudflare Workers and Cloudflare D1. Supports Windows, macOS and Linux. On Windows ARM, use an x64 Node runtime under emulation: the pinned workerd package does not support native Windows ARM.

```sh
npm ci
npm run build
```

The build generates `dist/server/wrangler.json`. Apply the initial migration **once per local database** before creating a room:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_strong_dormammu.sql
```

Then run:

```sh
npm run dev
```

Use the local URL printed by the server (normally `http://localhost:5173`). `npm start` previews the built Worker locally. Both previews share `.wrangler/state` with migrations. Phones cannot access a laptop through a localhost QR URL; use a deployed HTTPS URL for classroom play.

For a type check, run `npx tsc --noEmit`.

## Source and hosting

GitHub stores the source. **GitHub Pages cannot run the multiplayer backend.** Production needs a Worker-compatible host, a shared D1 database bound as `DB`, and the SQL migration applied to that production database.

The repository retains the original starter's build helpers. `.openai/hosting.json` declares the logical DB binding and an unpublished Sites registration; it contains no credentials and does not represent a working deployment. The generated local Wrangler configuration uses a placeholder database ID. Configure a real database and deployment before publishing a Worker. No production deployment is included.

## Code map

| File | Purpose |
| --- | --- |
| `app/Game.tsx` | Presenter/player UI, QR, polling and session restore |
| `app/globals.css` | Responsive dark blue styles |
| `app/api/game/route.ts` | Create, join, choose, advance and read API |
| `lib/game.ts` | Strategies, fictional events and scoring |
| `lib/raw-db.ts` | D1 binding access |
| `db/schema.ts`, `drizzle/` | Schema and migration |

Decisions and scoring are server-authoritative. All players in a room receive the same randomly selected event per round. Future event alternatives are present in the client bundle; this is a casual classroom simulation. Company names are stored in D1 and shown to room participants. No case PDF or real student information is bundled.

## Classroom readiness

Previous local validation covered 30 simultaneous founders through all four rounds, host authorization, hidden selected events, duplicate choices, late joining, missed decisions and score arithmetic. Browser checks covered room creation, QR generation, joining, locked-choice restoration after refresh and a 390 × 844 phone layout.

Rehearse on the final deployed URL with two physical phones and a presenter laptop, and review scoring balance. Scenarios and events are fictional teaching material.
