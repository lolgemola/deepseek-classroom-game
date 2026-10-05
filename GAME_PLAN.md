# DeepSeek classroom game: implemented scope

The user approved implementation of a rule-driven adaptive simulation, without AI. Target classroom time is 10–15 minutes including discussion. This replaces the earlier single-card decision game.

## Implemented decisions

- Setup: name, fictional starting hub (research / enterprise / developer), release model (open / closed / open core).
- Four rounds: customer focus, price, investment profile (research / reliability / ecosystem / keep cash).
- Draft → review → confirm. Drafts restore after refresh; submitted plans are private and server-authoritative.
- Capabilities and customer relationships carry forward; results explain cash and operating trade-offs.
- Nine collective-choice conditions alter the next market, published before students decide. Numeric rules are in RULES.md.
- Highest ending cash among solvent companies wins, with cash ties sharing rank. Show customers, trust and capabilities for discussion.
- Missed decisions continue the previous focus/price without investing. First-round default: balanced, standard, no investment.

## Classroom flow

Joining/setup 1–2 minutes → four cycles of market briefing (about 15 seconds), planning (75 seconds suggested) and result explanation (20–30 seconds) → final discussion 2–3 minutes.

Presenter controls lobby → briefing → planning → results → next briefing → finished. Timer expiry never submits or advances automatically. Interrupted result calculation can be resumed; closed plans cannot change.

## Validation and limits

Model tests cover startup fairness, reserve enforcement, adaptive conditions, privacy, deterministic results, capability persistence, service capacity, cash reconciliation, missed plans, bankruptcy and ranking. API smoke tests exercise 30 founders through four rounds, including a close/submit race. The balance sweep compares 324 constant strategies in five classroom compositions; it deliberately checks that different markets have different strongest plans and that investment and cash preservation both have useful contexts.

Rehearse the final deployed version with two physical phones and a presenter laptop. This is a teaching model, not a real-world AI economic forecast. Short-horizon cash ranking can favor different strategies than long-term value; discuss that limitation.

## Deferred

AI narration or event generation is excluded. Also defer borrowing, equity fundraising, manual budget sliders, cloud-contract negotiation, changing hubs/releases, and a fixed customer pool split among class competitors. Production hosting remains a separate task; GitHub source publishing does not deploy a playable backend.
