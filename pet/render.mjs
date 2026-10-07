const DEFAULT_STATE = {
  schemaVersion: 1, owner: 'tkv00', adoptedOn: '2026-01-01', asOf: '2026-01-01', generation: 1,
  status: 'alive', mood: 'happy', level: 1, xp: 0, nextLevelXp: 20, food: 0,
  totalFoodEarned: 0, totalFoodEaten: 0, commitRemainder: 0, idleDays: 0, streak: 0,
  bestStreak: 0, totalCommits: 0, days: [], history: [], health: 100, latestCommitDate: null, daysAlive: 1
};

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const isoDate = (value, offset) => { const d = new Date(`${value || '2026-01-01'}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10); };
const txt = (x, y, value, size = 16, fill = '#42345f', weight = 600, anchor = 'start', extra = '') =>
  `<text x="${x}" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(value)}</text>`;

function creature(state) {
  if (state.status === 'dead' || state.mood === 'dead') return `<g transform="translate(275 235)">
    <ellipse cx="55" cy="163" rx="105" ry="19" fill="#c7b8df" opacity=".45"/>
    <path d="M-11 142V60c0-53 31-80 66-80s66 27 66 80v82" fill="#f5f0ff" stroke="#765ca4" stroke-width="7"/>
    <path d="M-11 142q19-27 38 0 19-27 38 0 19-27 38 0 19-27 38 0" fill="none" stroke="#765ca4" stroke-width="7"/>
    <circle cx="30" cy="55" r="6" fill="#42345f"/><circle cx="80" cy="55" r="6" fill="#42345f"/>
    <path d="M42 83q13 12 26 0" fill="none" stroke="#42345f" stroke-width="5" stroke-linecap="round"/>
    ${txt(55, 190, 'GOODBYE, COMMITCHI', 13, '#765ca4', 800, 'middle')}
  </g>`;
  const level = n(state.level, 1);
  const grown = level >= 6, baby = level >= 3;
  const body = grown ? '#8bd7bf' : baby ? '#a9e5cf' : '#c5f1df';
  return `<g transform="translate(275 218)">
    <ellipse cx="65" cy="190" rx="108" ry="21" fill="#c7b8df" opacity=".45"/>
    ${level >= 10 ? '<path d="M30 5l-18-27 29 10 25-25 13 29 31-5-17 27" fill="#ffd268" stroke="#9b642c" stroke-width="6"/><path d="M39-2h45v14H39z" fill="#ffe493"/>' : ''}
    <path d="M-4 144V72Q-4 4 65 4t69 68v72q0 38-69 38t-69-38Z" fill="${body}" stroke="#42345f" stroke-width="8"/>
    <path d="M-2 105q-27 5-31-19 22-20 37 1M132 105q27 5 31-19-22-20-37 1" fill="${body}" stroke="#42345f" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="39" cy="78" r="7" fill="#42345f"/><circle cx="91" cy="78" r="7" fill="#42345f"/>
    <path d="M50 109q15 ${state.mood === 'critical' ? '-4' : '14'} 30 0" fill="none" stroke="#42345f" stroke-width="6" stroke-linecap="round"/>
    ${state.mood === 'hungry' ? '<path d="M14 63l-10-6M116 63l10-6" stroke="#ef7a9a" stroke-width="5" stroke-linecap="round"/>' : ''}
    <circle cx="24" cy="102" r="11" fill="#ef9bb4" opacity=".75"/><circle cx="106" cy="102" r="11" fill="#ef9bb4" opacity=".75"/>
    ${baby ? '<path d="M52 16q13-22 26 0" fill="none" stroke="#42345f" stroke-width="7" stroke-linecap="round"/>' : '<circle cx="65" cy="20" r="10" fill="#f9c8dc" stroke="#42345f" stroke-width="5"/>'}
    ${txt(65, 170, grown ? 'GROWN-UP' : baby ? 'BABY' : 'SPROUT', 12, '#42345f', 900, 'middle')}
  </g>`;
}

export function renderPet(input = {}, config = {}) {
  const s = {...DEFAULT_STATE, ...input};
  const owner = config.owner ?? s.owner ?? DEFAULT_STATE.owner;
  const name = config.name ?? '커밋치';
  const level = Math.max(1, Math.floor(n(s.level, 1)));
  const xp = Math.max(0, n(s.xp));
  const next = Math.max(1, n(s.nextLevelXp, 20));
  const levelStart = Math.max(0, (level - 1) * level * 10);
  const levelEnd = Math.max(levelStart + 1, next);
  const pct = Math.min(100, Math.max(0, Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100)));
  const food = Math.max(0, Math.floor(n(s.food)));
  const commits = Math.max(0, Math.floor(n(s.totalCommits)));
  const recorded = new Map((Array.isArray(s.days) ? s.days : []).map((day) => [day.date, day]));
  const days = Array.from({length: 14}, (_, i) => { const date = isoDate(s.asOf, i - 13); return recorded.get(date) ?? {date, commits: 0}; });
  const moodText = s.status === 'dead' || s.mood === 'dead' ? 'REST IN PEACE' : s.mood === 'critical' ? '위험 · CRITICAL' : s.mood === 'hungry' ? '배고픔 · HUNGRY' : '기분 좋음 · HAPPY';
  const moodColor = s.status === 'dead' || s.mood === 'dead' ? '#927fac' : s.mood === 'critical' ? '#e56f91' : s.mood === 'hungry' ? '#e8a548' : '#54a991';
  const grass = Array.from({length: 14}, (_, i) => days[i] ?? {date:'', commits:0});
  const cells = grass.map((d, i) => { const c=n(d.commits); const fill=c>=5?'#47a68d':c>=2?'#77c8a7':c>=1?'#b7e6d3':'#eee9f7'; return `<rect x="${620+(i%7)*34}" y="${232+Math.floor(i/7)*34}" width="23" height="23" rx="6" fill="${fill}"/><title>${esc(d.date || '기록 없음')}: ${c} commits</title>`; }).join('');
  const hearts = Array.from({length: 3}, (_, i) => `<path d="M${680+i*31} 102c-9-10-25 3 0 22 25-19 9-32 0-22Z" fill="${i < Math.ceil(Math.max(0,n(s.health,100))/35) ? '#ef7a9a' : '#e9dfef'}"/>`).join('');
  return `<!-- COMMITCHI | generated README SVG -->
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620" role="img" aria-labelledby="title desc">
<title id="title">${esc(name)} · COMMITCHI virtual pet</title><desc id="desc">${esc(owner)}'s GitHub commit tamagotchi, level ${level}</desc>
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f9f4ff"/><stop offset="1" stop-color="#e9ddf5"/></linearGradient><linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffdf2"/><stop offset="1" stop-color="#f5eddc"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="10" flood-color="#79649c" flood-opacity=".22"/></filter></defs>
<rect width="1000" height="620" rx="34" fill="url(#bg)"/>
<circle cx="64" cy="64" r="21" fill="#ffd9e7" opacity=".65"/><circle cx="925" cy="85" r="31" fill="#d6f1e9"/><path d="M67 150l6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z" fill="#f8ca73"/><path d="M902 180l4 9 10 1-8 7 2 10-8-5-9 5 2-10-8-7 10-1Z" fill="#bd9edc"/>
<g filter="url(#shadow)"><rect x="35" y="35" width="930" height="550" rx="32" fill="#c9b4e4" stroke="#8e72b2" stroke-width="4"/><rect x="63" y="63" width="874" height="494" rx="25" fill="#fffaf4" stroke="#967bb7" stroke-width="3"/></g>
${txt(91, 108, 'COMMITCHI', 25, '#493667', 950)}${txt(91, 131, `${owner}  ·  GEN ${n(s.generation,1)}`, 12, '#8f76a7', 800)}
<g>${hearts}${txt(833, 113, `LV ${level}`, 23, '#493667', 950, 'end')}${txt(833, 133, `XP ${xp} / ${next}`, 12, '#8f76a7', 800, 'end')}</g>
<rect x="92" y="153" width="470" height="284" rx="25" fill="url(#screen)" stroke="#c9b37c" stroke-width="4"/><path d="M113 191h428" stroke="#ebdfc6" stroke-width="2"/>
${txt(132, 181, moodText, 12, moodColor, 900)}${creature(s)}
<g>${txt(118, 489, 'FOOD', 11, '#8f76a7', 900)}${txt(118, 516, String(food), 28, '#493667', 950)}${txt(118, 538, `commits / 2 = 1 cookie`, 11, '#735a93', 800)}${txt(118, 550, `earned ${n(s.totalFoodEarned)}  ·  eaten ${n(s.totalFoodEaten)}`, 9, '#9b86ad', 650)}</g>
<g><rect x="282" y="479" width="280" height="14" rx="7" fill="#eee8f5"/><rect x="282" y="479" width="${Math.round(280*pct/100)}" height="14" rx="7" fill="#7bc6aa"/>${txt(282, 516, `${pct}% to next level`, 11, '#735a93', 800)}${txt(562, 516, `${n(s.streak)} day streak`, 11, '#735a93', 800, 'end')}</g>
<rect x="585" y="153" width="324" height="284" rx="25" fill="#fbf8ff" stroke="#d4c5e5" stroke-width="3"/>${txt(613, 184, 'GITHUB GARDEN', 13, '#493667', 900)}${txt(613, 205, 'last 14 days · grass = commits', 10, '#9b86ad', 650)}
<g>${cells}</g>${txt(613, 334, `best streak  ${n(s.bestStreak)}d`, 11, '#735a93', 800)}${txt(888, 334, `${commits} commits`, 11, '#735a93', 800, 'end')}<path d="M613 351h275" stroke="#ded3ea" stroke-width="2"/>${txt(613, 377, level >= 10 ? 'EVOLUTION  ·  CROWN UNLOCKED' : `EVOLUTION  ·  next at LV ${level >= 6 ? 10 : level >= 3 ? 6 : 3}`, 10, level >= 10 ? '#b57c2d' : '#8f76a7', 850)}${txt(613, 399, 'rule  ·  3일 무커밋 + 반영 유예 24h', 9, '#9b86ad', 700)}
<g>${txt(92, 604, s.status === 'dead' ? '☁  3일 무커밋 + 반영 유예 24h → 사망  ·  다시 커밋하면 새 생명' : `♡  무커밋 ${n(s.idleDays)}일  ·  ${s.latestCommitDate ? `last commit ${s.latestCommitDate}` : '첫 커밋을 기다리는 중'}`, 11, s.status === 'dead' ? '#927fac' : '#8f76a7', 700)}${txt(908, 604, `as of ${s.asOf || '—'}`, 10, '#9b86ad', 650, 'end')}</g>
</svg>`.replace(/[\t ]+$/gm, '');
}

export default renderPet;
