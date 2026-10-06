# DeepSeek classroom game

A 10–15 minute multiplayer activity closing a presentation about DeepSeek and sustainable monetization. Your base model is open: how will you fund its future? Deterministic rules only; no AI service, generated assets or random events.

## Playing

1. Presenter hosts a room and projects its QR code.
2. Students join with a company name, choose a starting ecosystem with explained trade-offs, review the starting company, and confirm ready.
3. Four rounds: choose commercial licensing, strategic partnerships or value-added services; set price; split up to 24 cash across research, reliability and ecosystem using sliders, or keep some/all cash. Review and lock the plan. Suggested planning time is 90 seconds for round 1 and 60 seconds for rounds 2–4, after reading the conditions; the presenter closes manually.
4. Results visually separate open adoption, paying accounts, gross billings, platform share, costs and cash. Collective choices shape the next published market.
5. Final company profiles and presenter comparison show cash history, community trust, adoption, paying accounts, dependence and operating surplus. Recommend a path for DeepSeek and explain what it sacrifices.

Start with 150 fictional cash and 20 open adopters, zero paying accounts. Investment spending is capped at 24 per round; switching paths costs 12 and has a temporary migration penalty. Keep 20 after discretionary costs. Highest ending cash among solvent companies wins; ties share rank. Bankruptcy is permanent. Missing plans continue the last path/price without investing; first-round fallback is standard-price services.

Aim for about 15 minutes including setup, briefings, a 90-second first decision window and three 60-second windows and discussion. Four-round cash is a financial result, not proof of long-term strategy. Rehearse on two phones and a presenter laptop.

Read [RULES.md](RULES.md) for the complete fictional model, [GAME_PLAN.md](GAME_PLAN.md) for implemented scope, and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the design rationale. Create fresh rooms after this version update; older rooms have an actionable return-to-join message. No additional database migration is required for version 4.

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

Apply only pending migrations. `0002` adds setup readiness and preserves already configured founders. Old tables are retained, but old rooms and browser sessions are not reused by version 4. Start a new room. Do not replay migrations already applied.

Open the URL printed by the server, normally `http://127.0.0.1:5173`. `npm start` previews the built Worker locally. Both share `.wrangler/state` with migrations. Phones cannot reach a laptop through a localhost QR URL: classroom phone play requires an accessible deployment.

## Checks

```sh
npm test
npm run check:balance
npx tsc --noEmit
npm run build
```

With development running, `npm run test:api` creates disposable local test rooms and exercises 30 founders through four rounds. Pass another **test** URL with `npm run test:api -- http://127.0.0.1:PORT` if needed. It verifies private submissions, presenter access, duplicates, missed plans, adaptive conditions and a submission racing closure.

The balance sweep compares 189 constant and representative changing policies across seven classroom compositions. It checks distinct winning sequences, a competitive context for all paths, and bankruptcy frequency. It is a bounded search, not proof of universal balance. Rehearse the deployed version on two physical phones and a presenter laptop.

## Source and hosting

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, D1 and Drizzle. GitHub stores the source; **GitHub Pages cannot run the multiplayer backend**. Production needs a Worker-compatible host, a real D1 database bound as `DB`, and the migrations applied to that database.

The original starter build helpers and `.openai/hosting.json` remain. That file declares the logical DB binding and the Sites registration, not credentials. The local Wrangler config has a placeholder database ID. The public game is hosted with Sites at https://deepseek-market-game.lukas727.chatgpt.site. Source updates use the registered Sites project.

| File | Purpose |
| --- | --- |
| `app/Game.tsx` | Presenter/player screens, QR, draft and session restoration |
| `app/api/game/route.ts` | Server-authoritative room phases and plan submission |
| `lib/simulation.ts` | Economics, market rules, results and ranking |
| `db/schema.ts`, `drizzle/` | Legacy-preserving version 4 schema and migration |
| `tests/`, `scripts/check-balance.mjs`, `scripts/smoke-game.mjs` | Model, balance and API verification |

Current plans remain private until the round closes; the next bulletin uses aggregated choices. Session tokens and local drafts are stored on the device; confirmed plans and shared room state live in D1. Company names are visible to room participants. Fictional teaching material only; no student roster or case PDF is bundled. This is a casual classroom simulation, and its rules are visible in the client bundle.
