import assert from 'node:assert/strict';
const origin = process.argv[2] ?? 'http://127.0.0.1:5173';
async function post(payload, expected = 200) {
  const r = await fetch(origin + '/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await r.json();
  assert.equal(r.status, expected, JSON.stringify(result));
  return result;
}
async function read(room, extra = {}) {
  const r = await fetch(origin + '/api/game?' + new URLSearchParams({ room, ...extra }));
  assert.equal(r.status, 200);
  return r.json();
}
const created = await post({ action: 'create' });
const room = created.room;
const advance = async () => { const view = await read(room, { host: created.host }); await post({ action: 'advance', room, host: created.host, version: view.version }); return read(room, { host: created.host }); };
await post({ action: 'advance', room, host: 'wrong', version: 0 }, 403);
await post({ action: 'advance', ...created, version: 0 }, 400);
await post({ action: 'join', room, name: 'Invalid startup', hub: 'mars', release: 'open' }, 400);
const founders = await Promise.all(Array.from({ length: 30 }, (_, i) => post({ action: 'join', room, name: 'Founder ' + i, hub: ['developer', 'research', 'enterprise'][i % 3], release: i < 20 ? 'open' : 'closed' })));
assert.equal((await read(room)).players.length, 30);
assert.equal(JSON.stringify(await read(room)).includes(created.host), false);
assert.equal(JSON.stringify(await read(room)).includes(founders[0].player), false);
await post({ action: 'choose', room, player: founders[0].player, round: 0, plan: { focus: 'developers', price: 'low', investment: 'ecosystem' } }, 400);
assert.equal((await advance()).phase, 'briefing');
await post({ action: 'join', room, name: 'Late', hub: 'developer', release: 'core' }, 400);
await post({ action: 'advance', ...created, version: 0 }, 409);
for (let round = 0; round < 4; round++) {
  assert.equal((await advance()).phase, 'planning');
  const expectedMarket = (await read(room)).market;
  const p = round === 0 ? { focus: 'developers', price: 'low', investment: 'ecosystem' } : { focus: 'enterprise', price: 'standard', investment: 'reliability' };
  await post({ action: 'choose', room, player: 'fake', round, plan: p }, 403);
  await post({ action: 'choose', room, player: founders[0].player, round, plan: { ...p, investment: 'free' } }, 400);
  await post({ action: 'choose', room, player: founders[0].player, round: round + 1, plan: p }, 400);
  const duplicate = await Promise.all([0, 1].map(() => fetch(origin + '/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'choose', room, player: founders[0].player, round, plan: p }) })));
  assert.deepEqual(duplicate.map(r => r.status).sort(), [200, 409]);
  await Promise.all(founders.slice(1, 29).map(f => post({ action: 'choose', room, player: f.player, round, plan: p })));
  const mine = await read(room, { player: founders[0].player });
  assert.deepEqual(mine.me.plan, p);
  assert.equal(mine.submitted, 29);
  assert.deepEqual(mine.market, expectedMarket);
  assert.equal(mine.nextMarket, null);
  assert.ok(mine.players.every(c => c.history.length === 0));
  const closed = await advance();
  assert.equal(closed.phase, 'results');
  const result = (await read(room, { player: founders[0].player })).me.history[round];
  assert.equal(result.closingCash, Math.round((result.openingCash - result.investmentCost + result.revenue - result.operatingCost - result.serviceCost) * 10) / 10);
  const missed = (await read(room, { player: founders[29].player })).me.history[round];
  assert.equal(missed.missed, true);
  assert.equal(missed.investmentCost, 0);
  if (round === 0) {
    for (const id of ['price-war', 'developer-crowding', 'integration-boom', 'open-standard', 'capacity-squeeze']) assert.ok(closed.nextMarket.signals.some(s => s.id === id), id);
  }
  await post({ action: 'choose', room, player: founders[29].player, round, plan: p }, 400);
  const next = await advance();
  assert.equal(next.phase, round === 3 ? 'finished' : 'briefing');
}
const finished = await read(room);
assert.equal(finished.players.length, 30);
assert.equal(finished.phase, 'finished');
await post({ action: 'advance', ...created, version: finished.version }, 400);
// A choice racing closure is either included exactly once or rejected.
const raceRoom = await post({ action: 'create' });
const raceFounder = await post({ action: 'join', room: raceRoom.room, name: 'Race', hub: 'developer', release: 'core' });
for (let i = 0; i < 2; i++) { const s = await read(raceRoom.room); await post({ action: 'advance', ...raceRoom, version: s.version }); }
const raceState = await read(raceRoom.room);
const [choice, close] = await Promise.all([
  fetch(origin + '/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'choose', room: raceRoom.room, player: raceFounder.player, round: 0, plan: { focus: 'balanced', price: 'standard', investment: 'research' } }) }),
  fetch(origin + '/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'advance', ...raceRoom, version: raceState.version }) }),
]);
assert.equal(close.status, 200);
assert.ok([200, 400, 409].includes(choice.status));
const raceResult = (await read(raceRoom.room, { player: raceFounder.player })).me.history[0];
assert.equal(raceResult.missed, choice.status !== 200);
console.log('API smoke passed: 30 founders, four rounds, adaptive conditions, private plans, duplicate protection, missed plans, authorization and close/submit race.');
