import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPet} from './render.mjs';

test('renders a safe, meaningful README SVG', () => {
  const svg = renderPet({owner:'<owner>', name:'</script>', level:3, xp:11, nextLevelXp:20, totalCommits:8, food:4, days:[{date:'2026-10-01', commits:3}]});
  assert.match(svg, /^<!-- COMMITCHI/);
  assert.match(svg, /<svg[^>]*width="1000"[^>]*height="620"/);
  assert.match(svg, /&lt;owner&gt;/);
  assert.doesNotMatch(svg, /<script|foreignObject/i);
  assert.match(svg, /GITHUB GARDEN/);
  assert.match(svg, /FOOD/);
});

test('renders dead state with readable status and recovery hint', () => {
  const svg = renderPet({status:'dead', mood:'dead', level:7, idleDays:3});
  assert.match(svg, /GOODBYE, COMMITCHI/);
  assert.match(svg, /3일 무커밋 \+ 반영 유예 24h/);
  assert.match(svg, /다시 커밋하면 새 생명/);
});

test('renders each growth stage marker', () => {
  assert.match(renderPet({level:1}), /SPROUT/);
  assert.match(renderPet({level:3}), /BABY/);
  assert.match(renderPet({level:6}), /GROWN-UP/);
  assert.match(renderPet({level:10}), /GROWN-UP/);
});

test('uses cumulative XP within the current level and explicit idle rule', () => {
  const svg = renderPet({level:3, xp:30, nextLevelXp:60, idleDays:2});
  assert.match(svg, /0% to next level/);
  assert.match(svg, /무커밋 2일/);
  assert.match(renderPet({status:'dead', mood:'dead', idleDays:3}), /반영 유예 24h/);
  assert.doesNotMatch(renderPet({level:6}), /CROWN UNLOCKED/);
  assert.match(renderPet({level:10}), /CROWN UNLOCKED/);
});
