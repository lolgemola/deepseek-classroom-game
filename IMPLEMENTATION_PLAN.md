# DeepSeek classroom game: strategy and visual redesign

Status: implemented as rules version 3. Validation and deployed status are recorded in GAME_PLAN.md and HANDOFF.md. Existing rooms do not need compatibility. Work in C:\github repo\deepseek-classroom-game. No AI services, generated events, or AI-generated assets.

## 1. Purpose and learning outcomes

The game closes a presentation about DeepSeek and sustainable monetization. Students apply the presentation by managing a fictional open-model company, then use their experience to recommend a path for DeepSeek.

Central question: How can an open-model company fund continued innovation while preserving the adoption and community trust that helped it grow?

Students should experience that adoption is different from revenue, different monetization paths require different capabilities, and growth can transfer value or control to partners. The game should produce multiple defensible recommendations rather than encode one correct strategy.

Use original, concise teaching text and fictional economic values. Do not copy case pages, exhibits, graphics, or historical pricing into the public repository. Describe the mechanics as classroom assumptions, not a forecast of DeepSeek's economics.

## 2. Classroom flow and decisions

Target: about 12 minutes, adjustable within 10–15.

| Activity | Suggested time |
| --- | --- |
| Presenter frames the challenge; students join and set up | 2 minutes |
| Four rounds: briefing, decisions, results | 7–8 minutes |
| Compare outcomes and discuss DeepSeek recommendation | 2–3 minutes |

Keep QR joining, company-name-first entry, ecosystem explanations, review/confirm, saved drafts, presenter-controlled progression, and a suggested 75-second decision timer. The timer remains manual; closing requires the existing incomplete-plan confirmation.

Setup becomes name → starting ecosystem → starting summary → ready. Keep research, enterprise, and developer ecosystems with their advantages and costs. Remove the separate open/closed/open-core selection. Every company begins with an openly available base model; choosing a paid offering does not revoke existing open rights.

Each round has exactly three decision groups:

1. Monetization path: commercial licensing, strategic partnerships, or value-added services.
2. Price positioning: accessible, standard, or premium; display what the price applies to for the selected path.
3. Investment: research, reliability, ecosystem, or keep cash.

The monetization path replaces customer focus. Developer and enterprise demand derive from the path, ecosystem, capabilities, price, and market conditions. Players may change paths in later rounds; existing capabilities persist. Show a modest, explicit transition cost and ramp-up effect in the review when switching. Determine final values during balance calibration; never charge them silently.

Rounds retain the four-step arc, with briefings rewritten around the case:

- Launch: choose how an open model becomes a business.
- Monetize: turn adoption into paying customers while keeping trust.
- Scale: handle growing demand and the delivery burden.
- Defend: respond to competitive pressure and evaluate future sustainability.

## 3. Economic model

Implement an explicit, deterministic rule table in lib/simulation.ts and document all final coefficients in RULES.md. Rules and explanations must share the same constants.

| Path | Paid offering | Advantage | Cost or risk | Supporting capabilities |
| --- | --- | --- | --- | --- |
| Commercial licensing | A new premium edition or commercial package with support | Earlier direct revenue and control over the offer | Narrower uptake; restrictive new terms can reduce community trust | Quality, reliability, enterprise credibility |
| Strategic partnerships | Partner-distributed model services and integrations | Distribution reach and partner delivery capacity | Partner revenue share and dependence; weaker direct customer ownership | Quality and reliability |
| Value-added services | Hosting, integration tools, fine-tuning, support | Open adoption and stronger retention as the ecosystem matures | Initial investment, delivery costs, and slower paid conversion | Ecosystem and reliability |

Licensing must be described as a new paid offering with defined terms, not a fee for rights already freely granted. Community-trust penalties should follow restrictive decisions or unmet promises, not automatically punish every paid license or every partnership.

Resolution order:

1. Validate plan, available cash, reserve, and any transition cost.
2. Apply investment and any path transition.
3. Calculate acquisition and retention, separating community adoption from paying accounts.
4. Determine demand served, using company capacity and explicitly modeled partner capacity.
5. Calculate gross paid revenue, partner share, investment, transition, operations, and delivery costs.
6. Reconcile closing cash exactly and apply trust changes from the identified causes.
7. Save customer, capability, dependency, and financial history with structured explanations.
8. Calculate next-round conditions from the just-closed class decisions and publish them before the next decision.

Add or clarify these state variables:

- Community adoption: people or organizations using the open model; not automatically billed.
- Paying developer and enterprise accounts: the base for paid revenue.
- Community trust: rename the existing trust measure consistently; capability fit and reliability separately influence purchase and retention.
- Partner dependence: a bounded index that rises with partner concentration and eases after diversification; label it as an index, not a probability.
- Ecosystem maturity: persistent capability supporting conversion and retention over time.
- Path tenure and transition history: enough state to model ramp-up without resetting accumulated capability or customers.

For partnerships, never count gross partner billings as money retained by the company. For services, use a maturation curve so sustained ecosystem investment can pay back within the four-round teaching horizon. Disclose that compressed timing is a simulation assumption. Existing customers should not disappear on a switch; define and explain which can migrate and how quickly.

Missed submissions continue the last path and price, with no investment or switch. Define a documented standard-price services fallback for a missed first round. Bankruptcy remains permanent; failed players can still observe and contribute to discussion.

## 4. Adaptive market rules

Keep collective decisions influencing the following round, with no randomness or hidden same-round event. Replace obsolete customer-focus and release-share conditions. Use normalized shares of active companies, including documented fallback plans for misses, so room size does not change thresholds.

Retain or adapt price competition, premium affordability gaps, research competition, ecosystem demand, capacity pressure, and lack-of-investment pressure. Add path-specific conditions:

- Many licensing offers: more free-alternative pressure, especially for undifferentiated paid packages.
- Many partnerships: platform bargaining power grows; disclose next-round revenue-share changes.
- Many service offers: generic hosting faces price pressure while mature integrations remain differentiated.
- Strong collective ecosystem investment: demand grows for complementary tools and support.

Each signal has a rule ID, measured cause, threshold, numeric effect, and explanatory text. Multiple effects can coexist with documented caps to avoid uncontrolled stacking. Keep all effects visible, but show the three most material first with an expandable remainder. Use the same rule calculations in the detailed rule panel and result explanations.

## 5. Visual design and screens

Use the existing dark-blue palette, Lucide icons, authored SVG, CSS, and small charts. No generated illustrations, decorative stock assets, or new visualization service is needed. Text and numbers remain authoritative.

### A. Strategy cards

Build three consistent cards with a small SVG/icon illustration, the paid offering, advantage, trade-off, and supporting investment. Preview the selected path's relationship diagram. Do not imply a recommended or universally strongest card. On phones, stack compact cards with details available without hover.

### B. Company relationship map

Create app/components/CompanyMap.tsx. Place the company at the centre, with community developers, enterprise customers, and a platform partner around it. Distinguish adoption, payments, and distribution using labeled lines and arrow direction. Licensing emphasizes direct premium customers; partnerships route distribution and part of payment through the platform; services emphasize the open community and complementary paid services.

Use actual adoption, paying-account, and dependence values. Do not imply a finite customer pool shared among classmates, since the model does not allocate one. On phones, use a compact vertical arrangement; on presenter screens, use a larger map for the selected company. Supply an equivalent accessible text summary.

### C. Round-results sequence

Create app/components/RoundResults.tsx and CashFlow.tsx. Reveal adoption/paying accounts → gross revenue and any partner share → spending → ending cash and trust. A simple cash-flow chart must reconcile the server ledger. Add a one-sentence takeaway grounded in the actual calculation, such as adoption growing faster than paid conversion or partner distribution expanding reach while reducing retained revenue.

Keep animations brief, with immediate skip and reduced-motion support. Animate once per room/company/round result, not on each poll or after refresh. Never make the presenter wait for student animations before advancing. Show precise values and fuller explanations on demand.

### D. Final company profile

Create app/components/CompanyProfile.tsx. Show a five-point cash-history chart including starting cash, current adoption and paying accounts, community trust, partner dependence, and last-round operating surplus. Define surplus as retained revenue minus operations and delivery costs; display investment and switching costs separately rather than hiding them.

Retain highest ending cash among solvent companies as the transparent game ranking. Label it a four-round financial result; do not award an invented long-term valuation or claim it proves the best DeepSeek strategy. Show the other measures alongside cash so classmates can explain competing outcomes. Failed firms remain visible and unranked.

The presenter sees the class path distribution and can compare two company profiles. Aggregate counts, not private unsubmitted plans, appear during play. Share compact completed-round histories after reveal to support final comparison; never include access tokens.

Final prompt: Based on your company's results, which path would you recommend to DeepSeek, and what would it have to sacrifice? Supporting prompts: Who captured the value? What funded continued research? Would the cash winner still be strongest over a longer horizon?

### E. Supporting visual polish

Use icons and short stat labels in the ecosystem setup; show a clearly labeled capability profile in its summary. Replace dense market paragraphs with cause → effect cards and small class-share bars. Keep essential decision information above optional details. Use consistent scales and labels, keyboard navigation, visible focus, and adequate contrast. Color never carries meaning alone.

## 6. Technical changes and data

- lib/simulation.ts: versioned types, path definitions, acquisition/conversion, revenue split, dependence, switching/ramp-up, adaptive rules, structured result ledger, and final diagnostics.
- app/CompanySetup.tsx: remove release step, preserve name-first flow and draft restoration, update summary.
- app/Game.tsx: integrate strategy decisions and new components; retain session restoration, polling, presenter phases, manual timer, submission locking, and readiness checks.
- app/globals.css: shared card, map, chart, animation, responsive, and reduced-motion styles.
- app/api/game/route.ts: validate new plans and setup, return the new views, preserve server authority and atomic closure. Publish completed histories only when revealed.
- db/schema.ts and drizzle/: add any needed persistent setup fields with an additive migration. Financial state remains in the authoritative room snapshot and decisions in plans. Legacy columns may remain unused; no destructive cleanup is needed.
- tests/simulation.test.mjs, scripts/check-balance.mjs, scripts/smoke-game.mjs: update meaningful checks for the new rules.
- RULES.md, GAME_PLAN.md, README.md, HANDOFF.md: update after implementation and calibration.

Increment RULES_VERSION and use a new session/draft storage namespace. Existing rooms need no simulation compatibility. If an old room is accessed, display an actionable old-version message and a way to create/join a fresh room instead of a generic server error. No old-room conversion or preservation work is required.

## 7. Implementation sequence

1. Specify the economic constants, state, revenue ledger, and adaptive thresholds. Write the initial rule table and accounting tests before UI work.
2. Implement the model and run a balance sweep. Verify coherent licensing, partnership, and services strategies can each succeed in appropriate markets; adjust coefficients before visual polish.
3. Add the schema migration and API changes, with fresh-room creation and new storage namespaces. Run the 30-player API smoke test.
4. Implement the simplified setup, strategy cards, and review screen. Ensure price, investments, and switching implications are visible before confirmation.
5. Implement the company map and accessible responsive version.
6. Implement result cash flow, structured explanations, one-time animation, and skip/reduced-motion behavior.
7. Implement final profiles, presenter comparison, class path distribution, and discussion prompts.
8. Run functional, balance, desktop/mobile, and classroom-timing validation. Update documentation and review the complete diff.
9. Commit and push the source to the established public GitHub repository, then publish the tested update to the existing Sites project using the Sites hosting workflow. Verify deployment success and database migration through native hosting tools.
10. Rehearse the published build on a presenter laptop and two physical phones before classroom use.

## 8. Verification and acceptance criteria

Model checks: exact cash reconciliation; gross versus retained partnership revenue; non-paying adoption; delayed service conversion; customer continuity after switching; reserve enforcement; trust causes; bounded dependency; threshold boundaries and effect caps; deterministic resolution; fallback plans; bankruptcy; ranking ties.

Balance checks: include constant plans and representative changing paths, multiple initial ecosystems, class compositions, early/late investment, and switching. Each path should have a plausible successful context. Check for a dominant plan across all tested markets, excessive bankruptcy, a systematically disadvantaged starting ecosystem, and incentives to skip all investment. Publish the sweep's tested scope and limitations; it cannot prove universal balance.

API checks: 30 founders across all four rounds; name-first readiness; unauthorized actions; invalid plans and unsupported setup; duplicate decisions; late joins; private unsubmitted plans; closure/submission races; refresh/recovery; published-history privacy; safe obsolete-room response.

UI checks: 390 × 844 phone, tablet, and presenter desktop; long company names; all paths; changing strategy; locked/missed plans; zero accounts; bankruptcy; many signals; comparison of two firms; no horizontal scrolling; chart/map text equivalents; reduced motion; keyboard use; refresh does not replay results.

Build and checks: working Node 22.13+, npm test, npm run check:balance, npm run test:api against the migrated local database, TypeScript check, appropriate scoped lint, and npm run build.

Ready for classroom use when a new player can explain what their firm sells, identify one concrete trade-off, understand the cash result, and defend a DeepSeek recommendation; the full activity fits 10–15 minutes; and the deployed multiplayer rehearsal succeeds.

## 9. Scope boundaries

No AI-generated behavior or assets. No borrowing, fundraising, budget sliders, contract negotiation, detailed geographic simulation, finite class-wide customer allocation, or additional rounds. No copying the supplied case into the app. Implement all four agreed visual features while keeping the interaction count at three decision groups per round.
