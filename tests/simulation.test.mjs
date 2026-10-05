import test from 'node:test';
import assert from 'node:assert/strict';
import { simulation as g } from './load-simulation.mjs';
const company = (id = 'a', hub = 'developer', release = 'core') => g.initialCompany({ id, name: id, hub, release });
const plan = (changes = {}) => ({ focus: 'balanced', price: 'standard', investment: 'save', ...changes });
const crowd = (n = 10, release = 'core') => Array.from({ length: n }, (_, i) => company(String(i), 'developer', release));
const submitted = (people, p) => Object.fromEntries(people.map(c => [c.id, p]));

test('nine startup combinations have equal cash and the advertised advantages', () => {
  for (const h of g.hubs) for (const r of g.releases) {
    const c = company('a', h.id, r.id);
    assert.equal(c.cash, 150);
    assert.equal(c.quality, h.id === 'research' ? 4 : 2);
    assert.equal(c.ecosystem, h.id === 'developer' ? 4 : 2);
    assert.equal(c.trust, h.id === 'enterprise' ? 65 : 55);
  }
});
test('malformed and overlong plans are rejected', () => {
  for (const bad of [null, {}, plan({ price: 'free' }), plan({ investment: -1 }), plan({ rationale: 'x'.repeat(161) })]) assert.equal(g.isPlan(bad), false);
  assert.equal(g.isPlan(plan({ rationale: 'An affordable integration offer' })), true);
});
test('public company state never inherits database access tokens', () => {
  const c = g.initialCompany({ id: 'a', name: 'A', hub: 'developer', release: 'open', token: 'private-token', room: 'private-room' });
  assert.equal('token' in c, false);
  assert.equal('room' in c, false);
});
test('investment reserves and bankruptcy are enforced', () => {
  assert.equal(g.canAfford({ ...company(), cash: 43.9 }, 'research'), false);
  assert.equal(g.canAfford({ ...company(), cash: 44 }, 'research'), true);
  assert.equal(g.canAfford({ ...company(), cash: 1 }, 'save'), true);
  assert.equal(g.canAfford({ ...company(), failed: true }, 'save'), false);
  assert.throws(() => g.resolveCompany({ ...company(), cash: 40 }, plan({ investment: 'research' }), g.initialMarket()));
});
test('price war triggers at 50%, but below the threshold does not', () => {
  const people = crowd();
  const plans = submitted(people, plan());
  for (let i = 0; i < 4; i++) plans[String(i)] = plan({ price: 'low' });
  assert.equal(g.nextMarket(people, plans, 1).revenueFactor, 1);
  plans['4'] = plan({ price: 'low' });
  assert.equal(g.nextMarket(people, plans, 1).revenueFactor, 0.85);
});
test('each adaptive trigger creates its stated market effect', () => {
  const people = crowd(10, 'open');
  const cases = [
    ['enterprise-crowding', { focus: 'enterprise' }, m => m.enterpriseDemand === 1.1 * 0.6],
    ['developer-crowding', { focus: 'developers' }, m => m.developerDemand === 1.08 * 0.6],
    ['benchmark-race', { investment: 'research' }, m => m.qualityWeight === 2],
    ['integration-boom', { investment: 'ecosystem' }, m => m.ecosystemWeight === 1.5],
    ['affordability-gap', { price: 'premium' }, m => m.developerDemand === 1.08 * 1.12],
    ['outside-rival', { investment: 'save' }, m => m.qualityWeight === 1.25],
  ];
  for (const [id, changes, check] of cases) {
    const m = g.nextMarket(people, submitted(people, plan(changes)), 1);
    assert.ok(m.signals.some(s => s.id === id), id);
    assert.ok(check(m), id);
  }
  const open = g.nextMarket(people, submitted(people, plan()), 1);
  assert.ok(open.openPressure);
  assert.equal(open.serviceFactor, 1.2);
});
test('reliable markets avoid a capacity squeeze', () => {
  const people = crowd().map(c => ({ ...c, reliability: 5 }));
  assert.equal(g.nextMarket(people, submitted(people, plan()), 1).serviceFactor, 1);
});
test('market effects use shares, so identical class composition scales fairly', () => {
  const a = crowd(5), b = crowd(30);
  const ma = g.nextMarket(a, submitted(a, plan({ focus: 'enterprise', price: 'low' })), 1);
  const mb = g.nextMarket(b, submitted(b, plan({ focus: 'enterprise', price: 'low' })), 1);
  assert.deepEqual({ ...ma, mix: null }, { ...mb, mix: null });
});
test('price-war revenue falls 15% before rounding, with low-price customers unchanged', () => {
  const c = company();
  const market = g.initialMarket();
  const normal = g.resolveCompany(c, plan({ price: 'low' }), market);
  const squeezed = g.resolveCompany(c, plan({ price: 'low' }), { ...market, revenueFactor: 0.85 });
  assert.equal(squeezed.developers, normal.developers);
  assert.equal(squeezed.enterprise, normal.enterprise);
  const rawRevenue = normal.developers * 1.2 * 0.88 + normal.enterprise * 3 * 0.94;
  assert.equal(squeezed.history[0].revenue, Math.round(rawRevenue * 0.85 * 10) / 10);
});
test('every result reconciles cash, caps capabilities, and respects service capacity', () => {
  for (const h of g.hubs) for (const release of g.releases) for (const focus of g.focuses) for (const price of g.prices) for (const investment of g.investments) {
    const c = g.resolveCompany(company('a', h.id, release.id), plan({ focus: focus.id, price: price.id, investment: investment.id }), g.initialMarket());
    const r = c.history[0];
    assert.equal(c.cash, Math.round((r.openingCash - r.investmentCost + r.revenue - r.operatingCost - r.serviceCost) * 10) / 10);
    assert.ok(c.developers + c.enterprise * 3 <= r.capacity);
    assert.ok(c.trust >= 0 && c.trust <= 100);
    assert.ok(c.quality <= 10 && c.reliability <= 10 && c.ecosystem <= 10);
  }
});
test('missing decisions carry focus and price, never spending on investment', () => {
  const first = g.resolveCompany(company(), plan({ focus: 'enterprise', price: 'low', investment: 'research' }), g.initialMarket());
  const second = g.resolveCompany(first, undefined, g.initialMarket(1));
  assert.deepEqual(second.history[1].plan, { focus: 'enterprise', price: 'low', investment: 'save' });
  assert.equal(second.history[1].investmentCost, 0);
  assert.equal(second.history[1].missed, true);
  assert.deepEqual(g.fallbackPlan(company()), plan());
});
test('investment persists and has diminishing returns', () => {
  const first = g.resolveCompany(company(), plan({ investment: 'research' }), g.initialMarket());
  const second = g.resolveCompany(first, plan({ investment: 'research' }), g.initialMarket(1));
  assert.ok(second.quality > first.quality);
  assert.ok(second.quality - first.quality < first.quality - 2);
});
test('new collective choices cannot change the market used in that same round', () => {
  const people = crowd();
  const initial = { companies: people, markets: [g.initialMarket()] };
  const copy = JSON.stringify(initial);
  const closed = g.closeRound(initial, submitted(people, plan({ price: 'low', focus: 'enterprise' })), 0);
  assert.equal(JSON.stringify(initial), copy);
  assert.deepEqual(closed.markets[0], initial.markets[0]);
  assert.ok(closed.markets[1].signals.some(s => s.id === 'price-war'));
  assert.equal(closed.companies[0].history.length, 1);
});
test('failure is irreversible; failed companies cannot shape the next market', () => {
  const c = { ...company('a', 'research'), cash: 0.1, developers: 0, enterprise: 0, trust: 0, quality: 0, reliability: 0, ecosystem: 0 };
  const failed = g.resolveCompany(c, plan({ price: 'premium', focus: 'enterprise' }), g.initialMarket());
  assert.equal(failed.failed, true);
  assert.equal(g.resolveCompany(failed, undefined, g.initialMarket(1)), failed);
  const m = g.nextMarket([failed, company('b')], { a: plan({ price: 'low' }), b: plan() }, 1);
  assert.equal(m.mix.count, 1);
  assert.equal(m.mix.low, 0);
});
test('four rounds finish deterministically with no fifth market', () => {
  let state = { companies: crowd(30), markets: [g.initialMarket()] };
  const plans = submitted(state.companies, plan({ investment: 'reliability' }));
  for (let r = 0; r < 4; r++) state = g.closeRound(state, plans, r);
  assert.equal(state.markets.length, 4);
  assert.equal(state.companies[0].history.length, 4);
  let repeat = { companies: crowd(30), markets: [g.initialMarket()] };
  for (let r = 0; r < 4; r++) repeat = g.closeRound(repeat, plans, r);
  assert.deepEqual(state, repeat);
});
test('solvent companies rank before failed companies; cash breaks order', () => {
  const a = { ...company('a'), cash: 20 }, b = { ...company('b'), cash: 40 }, c = { ...company('c'), cash: 100, failed: true };
  assert.deepEqual(g.rankCompanies([c, a, b]).map(c => c.id), ['b', 'a', 'c']);
});
