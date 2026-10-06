# Classroom rules: version 3

All numbers are fictional teaching assumptions. The game is deterministic. Adoption, account demand, delivery and money are calculated on the server. No AI, generated assets, hidden same-round event, or random market event is used. Case text and graphics are not included.

## Setup and timing

Name → ecosystem → review → ready. The base model stays open for every company. Every founder starts with 150 cash, 20 community adopters, zero paying accounts, reliability 2/10 and dependence 0/100.

| Ecosystem | Quality | Ecosystem capability | Community trust | Base operating cost | Acquisition bonus |
| --- | --- | --- | --- | --- | --- |
| Research | 4 | 2 | 55 | 18 | None |
| Enterprise | 2 | 2 | 65 | 14 | New enterprise accounts ×1.15 |
| Developer | 2 | 4 | 55 | 10 | Community growth ×1.10 |

Four rounds: Launch, Monetize, Scale, Defend. Suggested planning time: 90 seconds in round 1, 60 seconds in rounds 2–4, manually closed by the presenter. Read conditions before opening decisions. Target total around 15 minutes: 2 minutes setup, 4.5 minutes decisions plus briefings/results, and 2–3 minutes discussion. Actual timing needs a class rehearsal.

## Decisions and paid offerings

| Path | Paid product | Accessible / standard / premium unit fee | Extra operating cost | Delivery and adoption |
| --- | --- | --- | --- | --- |
| Licensing | New premium edition and supported commercial package | 1.5 / 4 / 7 | 4 | Lower community growth; direct revenue |
| Partnerships | Partner-distributed access | 1.6 / 4 / 7 | 2 | Extra 35 capacity; platform revenue share |
| Services | Hosting, tools, integration and support | 1.3 / 3.2 / 5.5 | 8 | More open adoption; conversion matures |

A developer account uses one unit; an enterprise account uses three billed/delivery units. Commercial licensing never revokes existing free model rights. In this teaching model, premium licensing introduces restrictive terms in the new paid package: the 6-point trust penalty is multiplied by (1 − ecosystem cash / 24), so community investment cushions it proportionally. Ordinary paid licensing has no automatic trust penalty.

Use three sliders to allocate integer cash amounts totaling at most 24. Unspent budget stays as cash. A full 24 invested in one area increases [quality, reliability, ecosystem]: research [2.4,0.6,0.5], reliability [0.6,2.4,0.5], ecosystem [0.5,0.6,2.4]. Each gain is multiplied by (1 − opening capability/12); resulting capabilities round to one decimal and cap at 10. Split investments sum each full-investment gain vector weighted by cash allocated / 24, then apply diminishing returns once. Zero spending has no gains or cost. The UI projects updated capabilities, including cross-capability gains.

Changing a previously chosen path costs 12. At least 20 cash must remain after investment plus switching. A transition applies ×0.8 to new account acquisition and existing account retention that round; existing accounts are migrated, not discarded. Capabilities, community adoption, and trust persist. Path tenure restarts at one. Initial path selection is free. If no discretionary spending occurs, an already low-cash company can continue below the 20 reserve.

## Resolution formulas

Use updated capabilities for the following calculations. All monetary ledger entries round to one decimal; adoption/account counts round as specified. The authoritative implementation is lib/simulation.ts.

- Base demand by round: [1,1.08,1.20,1.25].
- New community adoption = 22 × demand × path growth × (1 + ecosystem ×0.07 × market ecosystem weight) × (opening trust/100 +0.45) × ecosystem-hub bonus. Path growth: licensing 0.85, partnerships 1.25, services 1.30.
- Community stock = round(opening adoption ×0.94 + new community adoption). Adoption alone produces no billings.
- New account conversion: licensing 0.48, partnerships 0.42; services 0.12 + ecosystem ×0.025 × market ecosystem weight + min(tenure−1,3) ×0.045. Clamp conversion to [0.10,0.80]. This is an input to new paid-account demand, not a promise that this percentage of all adopters is billed.
- Capability fit = clamp((quality + reliability)/10,0.3,1.25), using ecosystem in place of quality for services.
- Price demand multiplier: accessible 1.30, standard 1, premium 0.65 × fit. During a price war, multiply premium acquisition by 0.65 and standard by 0.90.
- Paid-account attraction = clamp(0.55 + quality ×0.09 × market quality weight + reliability ×0.035,0.4,2).
- New paid-account demand = new community adoption × conversion × price demand × price-war acquisition effect × attraction × licensing pressure (licensing only) × transition effect.
- New developer fraction: licensing 0.30, partnerships 0.60, services 0.75. Enterprise acquisition = remaining fraction/2, with enterprise-hub bonus.
- Retention = clamp(0.65 + opening trust/500 + reliability/80 + services ecosystem ×0.012 − premium mismatch 0.12,0.45,0.96), then multiply by the transition effect. A mismatch occurs when premium fit is below 0.70.
- Wanted accounts = round(existing accounts × retention + new accounts), separately by segment.
- Capacity = round(36 + reliability ×5 + partnership bonus 35). If wanted units exceed capacity, multiply both account counts by capacity/wanted units and floor. Unserved counts are wanted minus served. Classmates influence conditions; they do not split a finite customer pool.
- Gross billings = roundMoney((served developers + enterprise ×3) × unit fee × market revenue factor × services discount).
- Services discount factor = 1 − (1 − market services factor) × (1 − ecosystem/10). A mature ecosystem cushions generic-hosting pressure.
- Partner share rate = min(0.50, market base share + opening dependence ×0.001). Non-partnership paths have no partner share. Cut = roundMoney(gross billings × rate). Retained revenue = roundMoney(gross billings − cut).
- Operations = base ecosystem cost + path operating cost.
- Delivery = roundMoney((developers ×0.42 + enterprise ×1.25) × market delivery factor × (1 − reliability ×0.035) × partnership discount 0.75). Non-partner discount is 1.
- Operating surplus = roundMoney(retained revenue − operations − delivery), before investment or transition.
- Closing cash = roundMoney(opening cash + operating surplus − investment − transition).
- Dependence: partnership +22 per round, other paths −18, clamped to [0,100]. It is an illustrative index, not a probability. Revenue-share calculation uses opening dependence.
- Community trust: +3 for service ratio at least 0.95; otherwise −ceil((1−service ratio) ×24). Ecosystem investment adds 4 × ecosystem cash / 24. Restrictive premium licensing terms subtract 6 × (1 − ecosystem cash / 24). Round the total trust change once. Any premium capability mismatch subtracts 5. Clamp total trust to [0,100].

Services maturation is compressed into four rounds for teaching; it is not a forecast of real revenue timing. Economic results and explanations are saved together, including the gross/net revenue ledger.

## Adaptive conditions

Computed from active companies at the start of the closed round and their plans, including fallback plans. Path and price percentages normalize by active company count. Investment triggers use class budget shares: total cash assigned to an area / (24 × active companies). Kept share is unspent budget / (24 × active companies), including missed plans. A token allocation does not count as a full investment. Conditions affect only the next round and expire before recomputation.

| Trigger | Threshold | Next-round effect |
| --- | --- | --- |
| Accessible pricing | ≥50% | Revenue ×0.85; premium acquisition ×0.65, standard ×0.90 |
| Licensing | ≥60% | New licensing acquisition ×0.65 |
| Partnerships | ≥60% | Base partner share 40% instead of 28% |
| Services | ≥60% | Services factor 0.80, cushioned by ecosystem |
| Research budget share | ≥50% | Quality weight 1.50 |
| Ecosystem budget share | ≥50% | Ecosystem weight 1.50 |
| Low reliability | Opening mean <4 and reliability budget share <25% | Delivery cost ×1.20 |
| Premium pricing | ≥60% | Demand ×1.12 |
| Unspent budget share | ≥60% | Quality weight at least 1.25 |

Conditions can coexist. Quality weight uses the maximum, not addition; partner share caps at 50%; capability attraction and conversion are clamped as above. Each condition has a distinct bounded factor, so duplicate stacking cannot occur. All active effects are visible in the bulletin; the first three appear immediately and the rest expand.

## Missing decisions, bankruptcy, ranking and discussion

Missing decisions repeat the previous path and price with no investment; first-round fallback is services at standard price. Cash ≤0 is permanent bankruptcy; failed companies remain visible, unranked, and can observe. Highest ending cash among solvent companies wins; equal cash shares rank.

Profiles also show adoption, paying accounts, community trust, partner dependence and ongoing operating surplus. A four-round cash result does not establish long-term sustainability. Final discussion: Which path would you recommend to DeepSeek, and what would it have to sacrifice? Who captured value? What funded research? Would the winner change over a longer horizon?
