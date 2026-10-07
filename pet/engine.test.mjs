import test from 'node:test';
import assert from 'node:assert/strict';
import { createLedger, mergeDays, projectPet } from './engine.mjs';

const d = (date, commits) => ({ date, commits });

test('creates a versioned empty ledger', () => {
  assert.deepEqual(createLedger('kim', '2026-10-01'), {
    schemaVersion: 1, owner: 'kim', adoptedOn: '2026-10-01', days: []
  });
});

test('merges duplicate observations monotonically and preserves zero days', () => {
  let ledger = createLedger('kim', '2026-10-01');
  ledger = mergeDays(ledger, [d('2026-10-01', 4), d('2026-10-02', 0)], '2026-10-02');
  ledger = mergeDays(ledger, [d('2026-10-01', 2), d('2026-10-02', 3)], '2026-10-02');
  assert.deepEqual(ledger.days, [d('2026-10-01', 4), d('2026-10-02', 3)]);
  assert.equal(ledger.asOf, '2026-10-02');
});

test('rejects malformed dates, negative counts, holes, and future observations', () => {
  const ledger = createLedger('kim', '2026-10-01');
  assert.throws(() => mergeDays(ledger, [d('2026-10-01', 1)], '2026-10-03'), /missing|hole/i);
  assert.throws(() => mergeDays(ledger, [d('2026-02-30', 1)], '2026-02-30'), /date/i);
  assert.throws(() => mergeDays(ledger, [d('2026-10-01', -1)], '2026-10-01'), /nonnegative/i);
  assert.throws(() => mergeDays(ledger, [d('2026-10-04', 1)], '2026-10-03'), /outside/i);
  assert.doesNotThrow(() => mergeDays(createLedger('kim', '2024-02-28'), [d('2024-02-28', 0), d('2024-02-29', 1)], '2024-02-29'));
});

test('carries odd commits into the next day and caps meals per day', () => {
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), [
    d('2026-10-01', 5), d('2026-10-02', 1), d('2026-10-03', 0)
  ], '2026-10-03');
  const pet = projectPet(ledger, { asOf: '2026-10-03', maxMealsPerDay: 1 });
  assert.equal(pet.totalCommits, 6);
  assert.equal(pet.totalFoodEarned, 3);
  assert.equal(pet.totalFoodEaten, 3);
  assert.equal(pet.food, 0);
  assert.equal(pet.commitRemainder, 0);
  assert.equal(pet.xp, 30);
  assert.equal(pet.level, 2);
});

test('levels use cumulative thresholds and project is replay-idempotent', () => {
  const days = Array.from({ length: 10 }, (_, i) => d(`2026-10-${String(i + 1).padStart(2, '0')}`, 2));
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), days, '2026-10-10');
  const one = projectPet(ledger, { asOf: '2026-10-10' });
  const two = projectPet(ledger, { asOf: '2026-10-10' });
  assert.deepEqual(two, one);
  assert.equal(one.xp, 100);
  assert.equal(one.level, 3);
  assert.equal(one.nextLevelXp, 120);
});

test('incremental catch-up and one-shot replay produce the same projection', () => {
  const all = [d('2026-09-01', 3), d('2026-09-02', 0), d('2026-09-03', 4), d('2026-09-04', 1)];
  const oneShot = mergeDays(createLedger('kim', '2026-09-01'), all, '2026-09-04');
  let incremental = mergeDays(createLedger('kim', '2026-09-01'), all.slice(0, 2), '2026-09-02');
  incremental = mergeDays(incremental, all.slice(2), '2026-09-04');
  assert.deepEqual(projectPet(incremental, { asOf: '2026-09-04' }), projectPet(oneShot, { asOf: '2026-09-04' }));
});

test('four completed zero days cause death while today remains uncharged', () => {
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), [
    d('2026-10-01', 1), d('2026-10-02', 0), d('2026-10-03', 0), d('2026-10-04', 0), d('2026-10-05', 0), d('2026-10-06', 0)
  ], '2026-10-06');
  const before = projectPet(ledger, { asOf: '2026-10-05' });
  const after = projectPet(ledger, { asOf: '2026-10-06' });
  assert.equal(before.status, 'alive');
  assert.equal(before.idleDays, 3);
  assert.equal(after.status, 'dead');
  assert.equal(after.idleDays, 4);
  assert.equal(after.health, 0);
});

test('activity during the grace boundary permanently saves the same generation', () => {
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), [
    d('2026-10-01', 1), d('2026-10-02', 0), d('2026-10-03', 0), d('2026-10-04', 0), d('2026-10-05', 1), d('2026-10-06', 0)
  ], '2026-10-06');
  const atActivity = projectPet(ledger, { asOf: '2026-10-05' });
  const replayed = projectPet(ledger, { asOf: '2026-10-06' });
  assert.equal(atActivity.generation, 1);
  assert.equal(replayed.generation, 1);
  assert.equal(replayed.status, 'alive');
});

test('a later commit rebirths a dead pet and retains lifetime counters', () => {
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), [
    d('2026-10-01', 2), d('2026-10-02', 0), d('2026-10-03', 0), d('2026-10-04', 0), d('2026-10-05', 0), d('2026-10-06', 0), d('2026-10-07', 2)
  ], '2026-10-07');
  const pet = projectPet(ledger, { asOf: '2026-10-07' });
  assert.equal(pet.status, 'alive');
  assert.equal(pet.generation, 2);
  assert.equal(pet.daysAlive, 1);
  assert.equal(pet.xp, 10);
  assert.equal(pet.totalCommits, 4);
  assert.equal(pet.totalFoodEarned, 2);
  assert.equal(pet.history.length, 1);
  assert.equal(pet.history[0].status, 'dead');
  assert.equal(pet.daysAlive, 1);
});

test('inactive streak does not reset until the date is closed; adjacent active days extend it', () => {
  const ledger = mergeDays(createLedger('kim', '2026-10-01'), [
    d('2026-10-01', 1), d('2026-10-02', 1), d('2026-10-03', 0), d('2026-10-04', 1)
  ], '2026-10-04');
  const pet = projectPet(ledger, { asOf: '2026-10-04' });
  assert.equal(pet.streak, 1);
  assert.equal(pet.bestStreak, 2);
});

test('rejects invalid configuration and as-of outside the ledger range', () => {
  const ledger = createLedger('kim', '2026-10-01');
  assert.throws(() => projectPet(ledger, { asOf: '2026-09-30' }), /asOf|adoption/i);
  assert.throws(() => projectPet(ledger, { asOf: '2026-10-01', graceDays: -1 }), /grace/i);
  assert.throws(() => projectPet(ledger, { asOf: '2026-10-01', maxMealsPerDay: -1 }), /meals/i);
});

test('project rejects missing ledger dates', () => {
  const ledger = createLedger('kim', '2026-10-01');
  assert.throws(
    () => projectPet({...ledger, days: [{date: '2026-10-03', commits: 1}]}, { asOf: '2026-10-05' }),
    /missing/i
  );
});
