import test from "node:test";
import assert from "node:assert/strict";
import { simulation as g } from "./load-simulation.mjs";
const company = (id = "a", hub = "developer") =>
  g.initialCompany({ id, name: id, hub });
const plan = (extra = {}) => ({
  path: "services",
  price: "standard",
  investment: "save",
  ...extra,
});
const crowd = (n = 10) =>
  Array.from({ length: n }, (_, i) => company(String(i)));
const submit = (cs, p) => Object.fromEntries(cs.map((c) => [c.id, p]));
test("equal startup cash with distinct ecosystem advantages and no billed adoption", () => {
  for (const h of g.hubs) {
    const c = company("a", h.id);
    assert.equal(c.cash, 150);
    assert.equal(c.adoption, 20);
    assert.equal(c.developers + c.enterprise, 0);
    assert.equal(c.quality, h.id === "research" ? 4 : 2);
    assert.equal(c.ecosystem, h.id === "developer" ? 4 : 2);
  }
});
test("state sanitizes access tokens", () => {
  const c = g.initialCompany({
    id: "a",
    name: "A",
    hub: "research",
    token: "secret",
  });
  assert.equal("token" in c, false);
});
test("invalid paths, investments and oversized rationale rejected", () => {
  for (const p of [
    null,
    {},
    plan({ path: "closed" }),
    plan({ price: "free" }),
    plan({ investment: "borrow" }),
    plan({ rationale: "x".repeat(161) }),
  ])
    assert.equal(g.isPlan(p), false);
  assert.ok(g.isPlan(plan()));
});
test("investment plus transition must leave reserve", () => {
  const c = { ...company(), path: "services", cash: 55.9 };
  assert.equal(g.canAfford(c, "research", "licensing"), false);
  assert.equal(g.canAfford({ ...c, cash: 56 }, "research", "licensing"), true);
  assert.equal(g.canAfford({ ...c, cash: 31.9 }, "save", "licensing"), false);
  assert.equal(g.canAfford({ ...c, cash: 1 }, "save", "services"), true);
  assert.equal(g.canAfford({ ...c, failed: true }, "save"), false);
});
test("cash ledger reconciles all costs for every path and switch", () => {
  for (const path of g.paths) {
    let c = company();
    for (let r = 0; r < 4; r++) {
      const p = plan({
        path: r % 2 ? path.id : "services",
        investment: "research",
      });
      const result = g.resolveCompany(c, p, g.initialMarket(r));
      const h = result.history.at(-1);
      assert.equal(
        h.revenue,
        Math.round((h.grossRevenue - h.partnerCut) * 10) / 10,
      );
      assert.equal(
        h.closingCash,
        Math.round(
          (h.openingCash +
            h.grossRevenue -
            h.partnerCut -
            h.operatingCost -
            h.serviceCost -
            h.investmentCost -
            h.transitionCost) *
            10,
        ) / 10,
      );
      c = result;
    }
  }
});
test("partner share is charged against billings, dependence is bounded", () => {
  let c = company();
  for (let r = 0; r < 4; r++)
    c = g.resolveCompany(c, plan({ path: "partnerships" }), g.initialMarket(r));
  const h = c.history.at(-1);
  assert.ok(h.partnerCut > 0);
  assert.ok(h.revenue < h.grossRevenue);
  assert.equal(c.dependence, 88);
  const m = { ...g.initialMarket(0), partnerShare: 0.4 };
  const r = g
    .resolveCompany(
      { ...c, dependence: 100 },
      plan({ path: "partnerships" }),
      m,
    )
    .history.at(-1);
  assert.equal(r.partnerCut, Math.round(r.grossRevenue * 0.5 * 10) / 10);
});
test("services mature over time and ecosystem improves conversion", () => {
  const c = company();
  const first = g.resolveCompany(c, plan(), g.initialMarket());
  const second = g.resolveCompany(first, plan(), g.initialMarket(1));
  assert.ok(second.history[1].conversion > first.history[0].conversion);
  assert.ok(
    g.resolveCompany(c, plan({ investment: "ecosystem" }), g.initialMarket())
      .history[0].conversion > first.history[0].conversion,
  );
  assert.ok(first.adoption > first.developers + first.enterprise);
});
test("switching preserves capabilities and migrates accounts", () => {
  let c = g.resolveCompany(
    company(),
    plan({ investment: "ecosystem" }),
    g.initialMarket(),
  );
  c = { ...c, developers: 20, enterprise: 5 };
  const next = g.resolveCompany(
    c,
    plan({ path: "licensing" }),
    g.initialMarket(1),
  );
  assert.equal(next.history[1].transitionCost, 12);
  assert.equal(next.tenure, 1);
  assert.equal(next.ecosystem, c.ecosystem);
  assert.ok(next.developers > 0 && next.enterprise > 0);
  assert.equal(next.dependence, 0);
});
test("premium restrictive terms have explicit community trust consequences", () => {
  const c = { ...company(), quality: 8, reliability: 8 };
  const standard = g.resolveCompany(
    c,
    plan({ path: "licensing" }),
    g.initialMarket(),
  );
  const premium = g.resolveCompany(
    c,
    plan({ path: "licensing", price: "premium" }),
    g.initialMarket(),
  );
  assert.equal(standard.trust - premium.trust, 6);
  const ecosystem = g.resolveCompany(
    c,
    plan({ path: "licensing", price: "premium", investment: "ecosystem" }),
    g.initialMarket(),
  );
  assert.ok(ecosystem.trust > premium.trust);
});
test("overload reduces trust and does not create capacity", () => {
  const c = { ...company(), developers: 200, enterprise: 100 };
  const next = g.resolveCompany(c, plan(), g.initialMarket());
  const h = next.history[0];
  assert.ok(h.unserved > 0);
  assert.ok(next.trust < c.trust);
  assert.ok(next.developers + 3 * next.enterprise <= h.capacity);
});
test("adaptive thresholds are exact and room-size normalized", () => {
  for (const n of [10, 30]) {
    const cs = crowd(n),
      p = submit(cs, plan({ path: "licensing" }));
    for (let i = 0; i < n / 2 - 1; i++) p[String(i)] = plan({ price: "low" });
    assert.equal(g.nextMarket(cs, p, 1).revenueFactor, 1);
    p[String(n / 2 - 1)] = plan({ price: "low" });
    assert.equal(g.nextMarket(cs, p, 1).revenueFactor, 0.85);
  }
});
test("every collective rule activates its published effect", () => {
  const cs = crowd();
  const cases = [
    [
      "free-alternatives",
      { path: "licensing" },
      (m) => m.licensingFactor === 0.65,
    ],
    ["platform-power", { path: "partnerships" }, (m) => m.partnerShare === 0.4],
    ["hosting-crowding", {}, (m) => m.servicesFactor === 0.8],
    [
      "benchmark-race",
      { investment: "research" },
      (m) => m.qualityWeight === 1.5,
    ],
    [
      "integration-boom",
      { investment: "ecosystem" },
      (m) => m.ecosystemWeight === 1.5,
    ],
    ["affordability-gap", { price: "premium" }, (m) => m.demand > 1.08],
    ["outside-rival", {}, (m) => m.qualityWeight === 1.25],
    ["capacity-squeeze", {}, (m) => m.serviceFactor === 1.2],
  ];
  for (const [id, p, check] of cases) {
    const m = g.nextMarket(cs, submit(cs, plan(p)), 1);
    assert.ok(
      m.signals.some((s) => s.id === id),
      id,
    );
    assert.ok(check(m), id);
  }
});
test("mature integrations cushion service crowding and market effects reset", () => {
  const c = { ...company(), ecosystem: 10 };
  const normal = g.resolveCompany(c, plan(), g.initialMarket());
  const crowded = g.resolveCompany(c, plan(), {
    ...g.initialMarket(),
    servicesFactor: 0.8,
  });
  assert.equal(normal.history[0].grossRevenue, crowded.history[0].grossRevenue);
  const cs = crowd(3),
    p = Object.fromEntries(
      cs.map((c, i) => [
        c.id,
        plan({ path: g.paths[i].id, investment: "reliability" }),
      ]),
    );
  assert.equal(g.nextMarket(cs, p, 2).servicesFactor, 1);
});
test("misses retain path/price without spending; first miss is services", () => {
  const c = g.resolveCompany(company(), undefined, g.initialMarket());
  assert.equal(c.history[0].plan.path, "services");
  assert.ok(c.history[0].missed);
  const chosen = g.resolveCompany(
    company(),
    plan({ path: "licensing", price: "low", investment: "research" }),
    g.initialMarket(),
  );
  const missed = g.resolveCompany(chosen, undefined, g.initialMarket(1));
  assert.equal(missed.history[1].plan.path, "licensing");
  assert.equal(missed.history[1].investmentCost, 0);
  assert.equal(missed.history[1].transitionCost, 0);
});
test("resolution is deterministic and current plans only shape next market", () => {
  const cs = crowd();
  const s = { companies: cs, markets: [g.initialMarket()] },
    p = submit(cs, plan());
  assert.deepEqual(g.closeRound(s, p, 0), g.closeRound(s, p, 0));
  assert.equal(s.markets[0].servicesFactor, 1);
  assert.equal(g.closeRound(s, p, 0).markets[1].servicesFactor, 0.8);
});
test("failed firms stop playing and rank below solvent companies", () => {
  const c = { ...company(), cash: 0, failed: true };
  assert.equal(g.resolveCompany(c, plan(), g.initialMarket()), c);
  const ranked = g.rankCompanies([
    c,
    { ...company("b"), cash: 20 },
    { ...company("c"), cash: 50 },
  ]);
  assert.equal(ranked[0].id, "c");
  assert.equal(ranked.at(-1).id, "a");
});
test("split allocations reject overspending and malformed money", () => {
  for (const investment of [
    { research: 12, reliability: 8, ecosystem: 5 },
    { research: -1, reliability: 0, ecosystem: 0 },
    { research: 1.5, reliability: 0, ecosystem: 0 },
    { research: NaN, reliability: 0, ecosystem: 0 },
    { research: Infinity, reliability: 0, ecosystem: 0 },
    { research: "12", reliability: 0, ecosystem: 0 },
    { research: 12, reliability: 8 },
    { research: 0, reliability: 0, ecosystem: 0, borrow: 24 },
  ])
    assert.equal(g.isPlan(plan({ investment })), false);
  assert.ok(
    g.isPlan(
      plan({ investment: { research: 12, reliability: 8, ecosystem: 4 } }),
    ),
  );
});
test("split and partial spending produce weighted capabilities and a reconciled ledger", () => {
  const c = company("split", "research");
  for (const investment of [
    { research: 12, reliability: 8, ecosystem: 4 },
    { research: 6, reliability: 4, ecosystem: 2 },
    { research: 0, reliability: 0, ecosystem: 0 },
  ]) {
    const after = g.resolveCompany(c, plan({ investment }), g.initialMarket());
    const r = after.history[0];
    assert.equal(
      r.investmentCost,
      investment.research + investment.reliability + investment.ecosystem,
    );
    assert.deepEqual(
      [after.quality, after.reliability, after.ecosystem],
      g.projectedCapabilities(c, investment),
    );
    assert.equal(
      r.closingCash,
      Math.round(
        (r.openingCash +
          r.revenue -
          r.operatingCost -
          r.serviceCost -
          r.investmentCost -
          r.transitionCost) *
          10,
      ) / 10,
    );
  }
  const r = g.resolveCompany(
    c,
    plan({ investment: { research: 12, reliability: 0, ecosystem: 0 } }),
    g.initialMarket(),
  );
  assert.equal(r.quality, 4.8);
  assert.equal(r.reliability, 2.3);
  assert.equal(r.ecosystem, 2.2);
});
test("pure allocations preserve all-in outcomes and partial spending respects reserves", () => {
  for (const id of ["research", "reliability", "ecosystem", "save"]) {
    const c = company();
    const pure = g.investmentAllocation(id);
    const a = g.resolveCompany(c, plan({ investment: id }), g.initialMarket());
    const b = g.resolveCompany(
      c,
      plan({ investment: pure }),
      g.initialMarket(),
    );
    const { history: ah, ...av } = a,
      { history: bh, ...bv } = b;
    assert.deepEqual(av, bv);
    assert.equal(ah[0].closingCash, bh[0].closingCash);
  }
  const c = { ...company(), cash: 35, path: "services" };
  assert.ok(g.canAfford(c, { research: 10, reliability: 5, ecosystem: 0 }));
  assert.equal(
    g.canAfford(c, { research: 10, reliability: 6, ecosystem: 0 }),
    false,
  );
  assert.equal(
    g.canAfford(c, { research: 10, reliability: 5, ecosystem: 0 }, "licensing"),
    false,
  );
});
test("ecosystem trust support is proportional, tiny allocations do not bypass premium trade-offs", () => {
  const c = company("trust", "research"),
    market = g.initialMarket();
  const result = (n) =>
    g.resolveCompany(
      c,
      plan({
        path: "licensing",
        price: "premium",
        investment: { research: 0, reliability: 0, ecosystem: n },
      }),
      market,
    );
  assert.ok(result(12).trust > result(0).trust);
  assert.ok(result(12).trust < result(24).trust);
  assert.equal(result(1).trust, result(0).trust);
});
test("adaptive investment triggers use budget shares, not investor headcounts", () => {
  const cs = crowd();
  const p = (r, l, e) =>
    plan({ investment: { research: r, reliability: l, ecosystem: e } });
  assert.equal(g.nextMarket(cs, submit(cs, p(11, 6, 0)), 1).qualityWeight, 1);
  const m = g.nextMarket(cs, submit(cs, p(12, 6, 6)), 1);
  assert.equal(m.qualityWeight, 1.5);
  assert.equal(m.serviceFactor, 1);
  assert.equal(m.mix.research, 5);
  assert.equal(m.mix.save, 0);
  assert.equal(g.nextMarket(cs, submit(cs, p(0, 5, 0)), 1).serviceFactor, 1.2);
  assert.equal(g.nextMarket(cs, submit(cs, p(0, 0, 9)), 1).qualityWeight, 1.25);
  assert.equal(g.nextMarket(cs, submit(cs, p(0, 0, 10)), 1).qualityWeight, 1);
});
