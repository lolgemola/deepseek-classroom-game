# DeepSeek classroom game

A 10–15 minute multiplayer strategy simulation inspired by the DeepSeek case. Founders choose a fictional starting location and release model, then make connected decisions over four rounds. The class's collective choices change the next market through deterministic rules. The game uses no AI service, generated events or random market outcomes.

## Playing

1. Presenter selects **Host a new game** and projects the QR code.
2. Founders first join with only a company name. They then compare starting ecosystems (research, enterprise or developer), review each advantage and trade-off, and choose a release model (open, closed or open core). A starting-company summary shows capabilities and costs before confirmation. The presenter waits until everyone is ready.
3. Presenter introduces the market bulletin, then opens decisions. Each founder chooses customer focus, price and an investment profile, reviews the plan and confirms it. Drafts can be edited until confirmation.
4. After the suggested 75 seconds, presenter closes manually. Results explain revenue, investment, operating costs, service costs and remaining cash.
5. The class's decisions create the next bulletin: price competition, crowded segments, capability races and other pressures. Everyone sees the conditions before deciding again.
6. After four rounds, compare cash results and discuss what customers would pay for if the model were free.

All companies begin with 150 fictional cash, 6 developer customers and 2 enterprise customers. Investment costs 24; at least 20 cash must remain after investment. Capabilities persist with diminishing returns. Highest ending cash among solvent companies wins; cash ties share rank. Cash at zero or below means bankruptcy. Missed plans carry forward focus and price without investing; round one defaults to both markets and standard pricing.

Aim for 1–2 minutes joining, four rounds of about 2 minutes, and a 2–3 minute discussion. Timers are guides; the presenter controls all transitions.

Read [RULES.md](RULES.md) for the nine adaptive conditions and financial model. [GAME_PLAN.md](GAME_PLAN.md) records the implemented scope.

## Local setup

Requires Node **22.13 or later**, npm, and Windows, macOS or Linux. On Windows ARM, use **x64 Node under emulation** because the pinned workerd package does not support native Windows ARM. Check `node -p "process.version + ' ' + process.arch"`.

```sh
npm ci
npm run build
```

The build generates `dist/server/wrangler.json`. Apply each pending migration **once**, in order, to the local database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_strong_dormammu.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_daily_kang.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_sturdy_invisible_woman.sql
npm run dev
```

Apply only pending migrations. `0002` adds setup readiness and preserves already configured founders. Old tables are retained, but old rooms and browser sessions are not reused by version 2. Start a new room. Do not replay migrations already applied.

Open the URL printed by the server, normally `http://127.0.0.1:5173`. `npm start` previews the built Worker locally. Both share `.wrangler/state` with migrations. Phones cannot reach a laptop through a localhost QR URL: classroom phone play requires an accessible deployment.

## Checks

```sh
npm test
npm run check:balance
npx tsc --noEmit
npm run build
```

With development running, `npm run test:api` creates disposable local test rooms and exercises 30 founders through four rounds. Pass another **test** URL with `npm run test:api -- http://127.0.0.1:PORT` if needed. It verifies private submissions, presenter access, duplicates, missed plans, adaptive conditions and a submission racing closure.

The balance check compares 324 constant strategies against five classroom compositions. It checks that the strongest plan changes with the market, that investing can pay off, and that preserving cash has a defensible context. This is a rehearsal aid, not proof of balance across every possible sequence. Test the eventual deployed version with two physical phones and a presenter laptop before class.

## Source and hosting

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, D1 and Drizzle. GitHub stores the source; **GitHub Pages cannot run the multiplayer backend**. Production needs a Worker-compatible host, a real D1 database bound as `DB`, and the migrations applied to that database.

The original starter build helpers and `.openai/hosting.json` remain. That file declares the logical DB binding and the Sites registration, not credentials. The local Wrangler config has a placeholder database ID. The public game is hosted with Sites at https://deepseek-market-game.lukas727.chatgpt.site. Source updates use the registered Sites project.

| File | Purpose |
| --- | --- |
| `app/Game.tsx` | Presenter/player screens, QR, draft and session restoration |
| `app/api/game/route.ts` | Server-authoritative room phases and plan submission |
| `lib/simulation.ts` | Economics, market rules, results and ranking |
| `db/schema.ts`, `drizzle/` | Legacy-preserving version 2 schema and migration |
| `tests/`, `scripts/check-balance.mjs`, `scripts/smoke-game.mjs` | Model, balance and API verification |

Current plans remain private until the round closes; the next bulletin uses aggregated choices. Session tokens and local drafts are stored on the device; confirmed plans and shared room state live in D1. Company names are visible to room participants. Fictional teaching material only; no student roster or case PDF is bundled. This is a casual classroom simulation, and its rules are visible in the client bundle.
