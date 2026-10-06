# DeepSeek classroom game: implemented scope

Version 3 implements IMPLEMENTATION_PLAN.md. The user approved the full strategy and visual redesign and waived compatibility for existing rooms.

Purpose: close the DeepSeek presentation by applying the dilemma of funding innovation while preserving open adoption and community trust. Players run fictional open-model companies and defend a recommendation after four rounds.

Setup: company name → starting ecosystem → summary → ready. Three decisions per round: commercial licensing / strategic partnerships / value-added services, price, investment. Capabilities persist; switching has disclosed costs and migration effects. Open adoption is separate from paying accounts. Partnerships show gross billings and the platform cut; services mature over time. All mechanics are deterministic and server-authoritative.

Visuals: illustrated strategy cards, company relationship map, brief one-time result animation and cash reconciliation, five-point cash-history chart, final company profile, presenter comparison and class strategy-share bars. Phone layouts, keyboard focus, text equivalents and reduced motion are supported. SVG, Lucide icons and CSS only; no AI services or generated assets.

Classroom timing: about 2 minutes joining/setup, 7–8 minutes for four manual presenter-controlled rounds, 2–3 minutes discussion. Highest ending cash among solvent firms wins; profiles make other strategic outcomes visible. Final prompt asks students to recommend a path for DeepSeek and identify the sacrifice.

Existing D1 tables suffice: extended financial state is in versioned JSON snapshots. Legacy release column is unused and retains an open value for new founders. No new migration is needed beyond 0000–0002. Session and draft namespaces are version 3. Older rooms return an actionable 410 message; create fresh rooms.

Validation: model tests; 189 constant/representative switching policies across seven class compositions; 30-player full-round API smoke and closure race; TypeScript, scoped lint and production build; browser setup, draft restoration, decisions, results and responsive screens. Balance checks are a bounded search, not proof that no dominant strategy exists. Physical-phone rehearsal and actual classroom timing remain human checks.

Excluded: AI-generated events/assets, borrowing, fundraising, budget sliders, contract negotiation, detailed geography, finite class customer pool and extra rounds. The case PDF and copied case content are not published.
