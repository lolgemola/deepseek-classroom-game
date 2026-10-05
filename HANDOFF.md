# DeepSeek classroom game — current handoff

Working checkout: C:\github repo\deepseek-classroom-game. Public source: https://github.com/lolgemola/deepseek-classroom-game. The user approved a rule-driven adaptive simulation and explicitly excluded AI services and event generation. Do not publish through Sites unless requested.

Current version is a 10–15 minute strategy simulation with fictional starting hubs, fixed release models, three connected decisions per round, persistent capabilities, nine collective-choice market conditions, financial result explanations and cash ranking. See README.md for setup and RULES.md for all rules.

Core files: app/Game.tsx, app/globals.css, app/api/game/route.ts, lib/simulation.ts. Version 2 stores simulation_rooms, founders and plans in new D1 tables; original version 1 tables remain intact. Apply drizzle/0001_daily_kang.sql once after the original migration. Old rooms and tokens are not reused by version 2.

Use Node >=22.13; on Windows ARM use an x64 runtime. A per-user Node 22.22.0 x64 and npm installation is available at C:\Users\lukav\AppData\Local\Programs\node22-x64. PowerShell profiles select it, and scripts/run-framework.mjs reports old Node versions clearly.

Run npm test, npm run check:balance, npx tsc --noEmit and npm run build. With local development running, npm run test:api creates disposable rooms and checks 30 founders through four rounds, authorization, private plans, duplicate protection, missed plans and closure races.

All outcomes are calculated by server rules. Plan closure freezes submissions atomically and can resume interrupted resolution. Class behavior only affects the next published market, never secretly changes the current round. No AI keys, calls or generated assets are used.

The local database migration does not deploy production. A real Worker/D1 deployment and a rehearsal on two physical phones plus a presenter laptop remain necessary for classroom use. The .openai/hosting.json retains an unpublished Sites registration and logical DB binding, with no credentials. GitHub Pages cannot host the multiplayer backend.
