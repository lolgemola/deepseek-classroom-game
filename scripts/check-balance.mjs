import { simulation as g } from '../tests/load-simulation.mjs';
import assert from 'node:assert/strict';
const policies = [];
for (const h of g.hubs) for (const release of g.releases) for (const focus of g.focuses) for (const price of g.prices) for (const investment of g.investments) {
  policies.push({ hub: h.id, release: release.id, plan: { focus: focus.id, price: price.id, investment: investment.id } });
}
const classrooms = [
  ['Price cutters', { focus: 'developers', price: 'low', investment: 'ecosystem' }, 'open'],
  ['Enterprise rush', { focus: 'enterprise', price: 'premium', investment: 'research' }, 'closed'],
  ['Infrastructure builders', { focus: 'balanced', price: 'standard', investment: 'reliability' }, 'core'],
  ['Cash conservers', { focus: 'balanced', price: 'standard', investment: 'save' }, 'core'],
  ['Research race', { focus: 'balanced', price: 'standard', investment: 'research' }, 'core'],
];
const report = [];
for (const [name, p, release] of classrooms) {
  let reference = { companies: Array.from({ length: 30 }, (_, i) => g.initialCompany({ id: String(i), name: String(i), hub: g.hubs[i % 3].id, release })), markets: [g.initialMarket()] };
  for (let r = 0; r < 4; r++) {
    const plans = Object.fromEntries(reference.companies.filter(c => !c.failed).map(c => [c.id, g.canAfford(c, p.investment) ? p : { ...p, investment: 'save' }]));
    reference = g.closeRound(reference, plans, r);
  }
  const results = policies.map(policy => {
    let c = g.initialCompany({ id: 'test', name: 'test', hub: policy.hub, release: policy.release });
    for (const market of reference.markets) c = g.resolveCompany(c, g.canAfford(c, policy.plan.investment) ? policy.plan : { ...policy.plan, investment: 'save' }, market);
    return { ...policy, cash: c.cash, failed: c.failed };
  }).sort((a, b) => b.cash - a.cash);
  const bestSave = results.find(r => r.plan.investment === 'save');
  const bestInvestment = results.find(r => r.plan.investment !== 'save');
  report.push({ classroom: name, winner: results[0], bestSave: bestSave.cash, bestInvestment: bestInvestment.cash, bankrupt: results.filter(c => c.failed).length, policies: results.length });
}
console.log(JSON.stringify(report, null, 2));
assert.ok(new Set(report.map(r => JSON.stringify(r.winner.plan))).size >= 3, 'Market composition should change the strongest constant strategy');
assert.ok(report.some(r => r.bestInvestment > r.bestSave), 'Investment must pay off in at least one market');
assert.ok(report.some(r => r.bestSave > r.bestInvestment), 'Preserving cash must have a defensible market context');
