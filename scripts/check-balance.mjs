import { simulation as g } from "../tests/load-simulation.mjs";
import assert from "node:assert/strict";
const policies = [];
const allocations = [
  ...g.investments.map((i) => i.id),
  { research: 8, reliability: 8, ecosystem: 8 },
  { research: 12, reliability: 12, ecosystem: 0 },
  { research: 12, reliability: 0, ecosystem: 12 },
  { research: 0, reliability: 12, ecosystem: 12 },
  { research: 12, reliability: 0, ecosystem: 0 },
  { research: 0, reliability: 12, ecosystem: 0 },
  { research: 0, reliability: 0, ecosystem: 12 },
  { research: 12, reliability: 8, ecosystem: 4 },
  { research: 0, reliability: 6, ecosystem: 18 },
];
for (const h of g.hubs)
  for (const path of g.paths)
    for (const price of g.prices)
      for (const investment of allocations)
        policies.push({
          hub: h.id,
          plans: Array.from({ length: 4 }, () => ({
            path: path.id,
            price: price.id,
            investment: investment,
          })),
        });
for (const h of g.hubs)
  for (const start of g.paths)
    for (const end of g.paths)
      for (const timing of [1, 2, 3])
        policies.push({
          hub: h.id,
          plans: Array.from({ length: 4 }, (_, r) => ({
            path: r < timing ? start.id : end.id,
            price: r < 2 ? "standard" : "premium",
            investment:
              r === 3 ? "save" : r === 0 ? "ecosystem" : "reliability",
          })),
        });
const classrooms = [
  [
    "Licensing rush",
    { path: "licensing", price: "standard", investment: "research" },
  ],
  [
    "Platform rush",
    { path: "partnerships", price: "standard", investment: "research" },
  ],
  [
    "Service builders",
    { path: "services", price: "standard", investment: "ecosystem" },
  ],
  ["Price cutters", { path: "services", price: "low", investment: "save" }],
  [
    "Premium rush",
    { path: "licensing", price: "premium", investment: "reliability" },
  ],
  [
    "Open integrations",
    { path: "licensing", price: "standard", investment: "ecosystem" },
  ],
  [
    "Split investment",
    {
      path: "services",
      price: "standard",
      investment: { research: 12, reliability: 8, ecosystem: 4 },
    },
  ],
  ["Mixed market", null],
];
const report = [];
for (const [name, p] of classrooms) {
  let s = {
    companies: Array.from({ length: 30 }, (_, i) =>
      g.initialCompany({
        id: String(i),
        name: String(i),
        hub: g.hubs[i % 3].id,
      }),
    ),
    markets: [g.initialMarket()],
  };
  for (let r = 0; r < 4; r++) {
    const plans = Object.fromEntries(
      s.companies
        .filter((c) => !c.failed)
        .map((c, i) => {
          let plan = p ?? {
            path: g.paths[i % 3].id,
            price: g.prices[i % 3].id,
            investment: g.investments[(i + r) % 4].id,
          };
          if (!g.canAfford(c, plan.investment, plan.path))
            plan = g.fallbackPlan(c);
          return [c.id, plan];
        }),
    );
    s = g.closeRound(s, plans, r);
  }
  const results = policies
    .map((policy) => {
      let c = g.initialCompany({
        id: "candidate",
        name: "candidate",
        hub: policy.hub,
      });
      for (let r = 0; r < 4; r++) {
        let p = policy.plans[r];
        if (!g.canAfford(c, p.investment, p.path)) p = g.fallbackPlan(c);
        c = g.resolveCompany(c, p, s.markets[r]);
      }
      return { ...policy, cash: c.cash, failed: c.failed };
    })
    .sort((a, b) => b.cash - a.cash);
  report.push({
    classroom: name,
    winner: {
      hub: results[0].hub,
      sequence: results[0].plans
        .map(
          (p) =>
            p.path + "/" + p.price + "/" + g.investmentSummary(p.investment),
        )
        .join(" -> "),
      cash: results[0].cash,
    },
    bestByPath: Object.fromEntries(
      g.paths.map((p) => [
        p.id,
        results.filter((r) => r.plans.every((x) => x.path === p.id))[0].cash,
      ]),
    ),
    bestByHub: Object.fromEntries(
      g.hubs.map((h) => [h.id, results.find((r) => r.hub === h.id).cash]),
    ),
    bankrupt: results.filter((r) => r.failed).length,
    policies: results.length,
  });
}
console.log(JSON.stringify(report, null, 2));
assert.ok(
  new Set(report.map((r) => r.winner.sequence)).size >= 3,
  "Different markets should reward different policies",
);
for (const p of g.paths)
  assert.ok(
    report.some(
      (r) =>
        r.bestByPath[p.id] >= Math.max(...Object.values(r.bestByPath)) * 0.9,
    ),
    p.id + " needs a competitive context",
  );
assert.ok(
  report.every((r) => r.bankrupt < r.policies * 0.35),
  "Most tested policies should remain playable",
);
