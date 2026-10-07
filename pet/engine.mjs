const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_SPAN = 3660;

function dateValue(value, label = 'date') {
  if (typeof value !== 'string') throw new TypeError(`${label} must be YYYY-MM-DD`);
  const match = ISO_DATE.exec(value);
  if (!match) throw new RangeError(`${label} must be YYYY-MM-DD`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError(`${label} is not a real calendar date`);
  }
  return value;
}

function shiftDate(value, amount) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

function spanDays(start, end) {
  const result = [];
  for (let date = start; compare(date, end) <= 0; date = shiftDate(date, 1)) {
    result.push(date);
    if (result.length > MAX_SPAN) throw new RangeError(`date span exceeds ${MAX_SPAN} days`);
  }
  return result;
}

function count(value, label = 'commits') {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${label} must be a nonnegative safe integer`);
  return value;
}

function configValue(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < 0 || value > maximum) throw new RangeError(`invalid ${label}`);
  return value;
}

export function createLedger(owner, adoptedOn) {
  dateValue(adoptedOn, 'adoptedOn');
  if (typeof owner !== 'string' || owner.length === 0) throw new TypeError('owner must be a non-empty string');
  return { schemaVersion: 1, owner, adoptedOn, days: [] };
}

export function mergeDays(input, observations = [], throughDate) {
  if (!input || input.schemaVersion !== 1 || !Array.isArray(input.days)) throw new TypeError('invalid ledger');
  const adoptedOn = dateValue(input.adoptedOn, 'adoptedOn');
  const through = dateValue(throughDate, 'throughDate');
  if (through < adoptedOn) throw new RangeError('throughDate precedes adoption');
  const existing = new Map();
  for (const entry of input.days) {
    if (!entry || typeof entry !== 'object') throw new TypeError('invalid day');
    const date = dateValue(entry.date);
    if (date < adoptedOn || date > through) throw new RangeError('day is outside requested range');
    const commits = count(entry.commits);
    existing.set(date, Math.max(existing.get(date) ?? 0, commits));
  }
  const observed = new Map();
  for (const entry of observations) {
    if (!entry || typeof entry !== 'object') throw new TypeError('invalid observation');
    const date = dateValue(entry.date);
    if (date < adoptedOn || date > through) throw new RangeError('observation is outside requested range');
    observed.set(date, Math.max(observed.get(date) ?? 0, count(entry.commits)));
  }
  for (const date of spanDays(adoptedOn, through)) {
    if (!existing.has(date) && !observed.has(date)) throw new RangeError(`missing day ${date}`);
  }
  for (const [date, commits] of observed) existing.set(date, Math.max(existing.get(date) ?? 0, commits));
  const days = [...existing].sort(([a], [b]) => compare(a, b)).map(([date, commits]) => ({ date, commits }));
  return { ...input, days, asOf: through };
}

function levelFor(xp) {
  let level = 1;
  while (xp >= level * (level + 1) * 10) level += 1;
  return level;
}

export function projectPet(ledger, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('invalid options');
  if (!ledger || ledger.schemaVersion !== 1 || !Array.isArray(ledger.days)) throw new TypeError('invalid ledger');
  const adoptedOn = dateValue(ledger.adoptedOn, 'adoptedOn');
  const asOf = dateValue(options.asOf ?? ledger.asOf ?? adoptedOn, 'asOf');
  if (asOf < adoptedOn) throw new RangeError('asOf precedes adoption');
  const graceDays = configValue(options.graceDays ?? 1, 'graceDays');
  const deathAfterDays = configValue(options.deathAfterDays ?? 3, 'deathAfterDays', MAX_SPAN);
  if (deathAfterDays < 1) throw new RangeError('invalid deathAfterDays');
  const maxMealsPerDay = configValue(options.maxMealsPerDay ?? 3, 'maxMealsPerDay');
  const deathThreshold = deathAfterDays + graceDays;

  const records = new Map();
  for (const entry of ledger.days) {
    const date = dateValue(entry.date);
    if (date < adoptedOn || date > asOf) continue;
    records.set(date, Math.max(records.get(date) ?? 0, count(entry.commits)));
  }
  const dates = spanDays(adoptedOn, asOf);
  let generation = 1;
  let bornOn = adoptedOn;
  let deathDate = null;
  let status = 'alive';
  let food = 0;
  let remainder = 0;
  let xp = 0;
  let idleDays = 0;
  let streak = 0;
  let bestStreak = 0;
  let previousActive = false;
  let totalCommits = 0;
  let totalFoodEarned = 0;
  let totalFoodEaten = 0;
  let latestCommitDate = null;
  const history = [];
  const days = [];

  for (const date of dates) {
    if (!records.has(date)) throw new RangeError(`missing day ${date}`);
    const commits = records.get(date) ?? 0;
    days.push({ date, commits });
    if (commits > 0) { totalCommits += commits; latestCommitDate = date; }
    const closed = date < asOf;
    if (status === 'dead') {
      if (commits === 0) continue;
      generation += 1;
      bornOn = date;
      deathDate = null;
      status = 'alive'; food = 0; remainder = 0; xp = 0; idleDays = 0; streak = 0; previousActive = false;
    }

    if (commits > 0) {
      const gained = Math.floor((remainder + commits) / 2);
      remainder = (remainder + commits) % 2;
      food += gained;
      totalFoodEarned += gained;
      idleDays = 0;
      streak = previousActive ? streak + 1 : 1;
      bestStreak = Math.max(bestStreak, streak);
      previousActive = true;
    } else if (closed) {
      idleDays += 1;
      streak = 0;
      previousActive = false;
    } else {
      // An unfinished zero day is excluded from idleDays, but it is still
      // an inactive calendar day for the next day's streak adjacency.
      previousActive = false;
    }
    const eaten = Math.min(food, maxMealsPerDay);
    food -= eaten;
    totalFoodEaten += eaten;
    xp += eaten * 10;
    if (closed && commits === 0 && idleDays >= deathThreshold) {
      status = 'dead';
      deathDate = date;
      history.push({ generation, status: 'dead', deathDate: date });
      previousActive = false;
    }
  }

  const level = levelFor(xp);
  const dead = status === 'dead';
  const mood = dead ? 'dead' : idleDays >= 2 ? 'critical' : idleDays === 1 ? 'hungry' : 'happy';
  const daysAlive = spanDays(bornOn, deathDate ?? asOf).length;
  return {
    schemaVersion: 1, owner: ledger.owner, adoptedOn, asOf, generation, status, mood,
    level, xp, nextLevelXp: level * (level + 1) * 10, food,
    totalFoodEarned, totalFoodEaten, commitRemainder: remainder, idleDays, streak, bestStreak,
    totalCommits, days, history, health: dead ? 0 : Math.max(1, 100 - idleDays * 34), latestCommitDate,
    daysAlive
  };
}

export default { createLedger, mergeDays, projectPet };
