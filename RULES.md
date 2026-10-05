# Simulation rules (version 2)

All values are fictional teaching units. The model is deterministic and contains no AI calls or random market events. The implementation in `lib/simulation.ts` is the source of truth.

## Setup

Every company starts with 150 cash, 6 developers, 2 enterprises, reliability 2, quality 2, ecosystem 2 and trust 55. A research hub changes starting quality to 4 and costs 18 per round; an enterprise hub changes trust to 65, gives 15% more new enterprise acquisition and costs 14; a developer hub changes ecosystem to 4, gives 10% more developer acquisition and costs 10. All hubs can serve both segments.

Open releases multiply developer acquisition by 1.25 and earn 72% of developer list revenue / 88% of enterprise list revenue. Closed releases multiply developer acquisition by 0.8 and earn full list revenue. Open core multiplies developer acquisition by 1.05, earns 88% / 94% of list revenue, and adds 3 operating cash per round. Revenue represents paid conversion across the active customer base; free model adoption and paid service conversion differ.

## Plans

Customer focus weights new acquisition: focused segment ×1.4, other segment ×0.35; balanced ×0.85 for each.

| Price | Developer list revenue | Enterprise list revenue | New demand |
| --- | --- | --- | --- |
| Low | 1.2 | 3 | Developer ×1.4; enterprise ×1.15 |
| Standard | 2 | 5 | Baseline |
| Premium | 2.8 | 8 | Developer ×0.75 × fit; enterprise ×0.8 × fit |

Developer premium fit = (quality + ecosystem − 2) / 9; enterprise premium fit = (quality + reliability − 2) / 9. Each is bounded to 0.25–1.1. The targeted fit controls premium retention and trust effects; a balanced plan uses their mean. Fit below 0.65 reduces retention by 0.12 and trust by 5.

Research investment has quality/reliability/ecosystem gains [2.4, 0.6, 0.5]; reliability [0.6, 2.4, 0.5]; ecosystem [0.5, 0.6, 2.4]. Each costs 24. Each gain is multiplied by (1 − existing capability / 12), then the result is rounded to one decimal and capped at 10. Keep cash costs zero and preserves existing capabilities. Investment must leave at least 20 cash; this reserve does not guarantee solvency after service costs.

## Nine adaptive conditions

Conditions for round N+1 use the active companies at the beginning of closed round N and their actual plans. A missed plan uses the last focus and price with no investment. Shares, rather than raw counts, keep the same composition comparable across class sizes. Conditions last one round and are recalculated; they do not stack across time.

| Trigger | Condition next round |
| --- | --- |
| At least 50% use low pricing | List revenue falls 15%; new acquisition falls 60% for premium offers and 15% for standard offers |
| At least 60% target enterprises | New enterprise acquisition falls 40% |
| At least 60% target developers | New developer acquisition falls 40% |
| At least 50% invest in research | Quality's contribution to customer attraction doubles |
| Average starting reliability below 4 and fewer than 25% invest in reliability | Service costs rise 20% |
| At least 60% use open or open core | Closed developer acquisition falls 15% and closed revenue falls 18%; open developer acquisition rises 10% |
| At least 50% invest in ecosystem | Ecosystem's contribution to developer attraction increases 50% |
| At least 60% charge premium prices | New developer demand grows 12% |
| At least 60% keep cash | An outside rival improves; quality's contribution rises 25% |

If both quality conditions could apply, use the stronger weight rather than multiplying them. Different conditions can apply together and multiply their stated factors. Market bulletins show each triggered condition, its actual cause and its numeric effect before decisions open. With no triggers, the bulletin states normal growth. There is no next market after the final round, but the last class mix is shown for discussion.

## Customer economics

Demand grows by period: developer multipliers [1, 1.08, 1.2, 1.25], enterprise [1, 1.1, 1.15, 1.25]. Apply segment crowding and affordability conditions to these multipliers.

New developer acquisition starts from 18 and is multiplied by period demand, focus, price demand, price-competition effect, release model, open-standard effect, developer attraction, trust factor and hub effect. New enterprise acquisition starts from 6 and uses period demand, focus, price demand, price-competition effect, enterprise attraction, trust factor and hub effect.

Developer attraction = 0.55 + ecosystem ×0.1 × ecosystem weight + (quality − 3) ×0.1 × quality weight; cap to 0.25–2. Enterprise attraction = 0.45 + (quality − 3) ×0.09 × quality weight + reliability ×0.09; cap to 0.2–2. Trust factor = 0.65 + trust / 150.

Retention = 0.62 + trust / 400 + reliability / 80, minus the premium-fit penalty when applicable; cap to 0.45–0.95. Add retained customers to new acquisition and round to integers. Capacity = round(44 + reliability ×4). Developers consume 1 unit; enterprises 3. If requested load exceeds capacity, proportionally reduce both customer groups and round down. Unserved customers reduce trust.

Revenue = served customers × segment list rate × release paid conversion × price-war factor × closed/open-standard factor. Service costs = (developers ×0.32 + enterprises ×1.1) × service market factor × (1 − reliability ×0.035). Money is rounded to one decimal at each financial line.

Trust rises 4 when at least 95% of requested demand is served; otherwise falls by ceil((1 − served fraction) ×24). Reliability of at least 5 adds 2. Premium below the target fit subtracts 5. Trust is bounded to 0–100 and affects the next period's acquisition and retention.

## Resolution and victory

Order: validate plan and reserve → pay investment → improve capabilities → acquire and retain customers under the published conditions → limit service to capacity → calculate revenue and expenses → update trust → check solvency → publish next conditions.

Closing cash = opening cash − investment + revenue − operations − service. Cash at zero or below causes permanent bankruptcy. Failed companies cannot submit or influence later markets. Highest ending cash among surviving companies wins; equal cash shares rank. Failed companies are unranked but can inspect their history. This short financial horizon is explicitly part of the debrief.

Companies face a common simulated external market. They influence competition conditions but do not split a fixed class customer pool. There are no hidden same-round penalties based on other submissions. Forecasts are qualitative; actual results reconcile to the financial breakdown.
