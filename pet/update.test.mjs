import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {updatePet} from './update.mjs';

test('unsupported private mode stops before querying or creating pet files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try { await assert.rejects(updatePet({root,includePrivate:true,fetchDays:async()=>{throw new Error('must not query');}}),/private.*not supported/i); }
  finally {await rm(root,{recursive:true,force:true});}
});

test('first successful update adopts today, persists real counts and is byte-idempotent',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try {
    const opts={root,asOf:'2026-10-07',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-07',commits:3}]};
    const state=await updatePet(opts);
    assert.equal(state.totalCommits,3);assert.equal(state.totalFoodEarned,1);assert.equal(state.commitRemainder,1);
    const first=await readFile(join(root,'pet/data/state.json'),'utf8');
    assert.match(await readFile(join(root,'assets/commitchi.svg'),'utf8'),/<svg/);
    await updatePet(opts);
    assert.equal(await readFile(join(root,'pet/data/state.json'),'utf8'),first);
    await assert.rejects(updatePet({...opts,owner:'someone-else'}),/owner/i);
  } finally {await rm(root,{recursive:true,force:true});}
});
test('API failure and partial catch-up preserve every existing output',async()=>{
  const root=await mkdtemp(join(tmpdir(),'commitchi-test-'));
  try {
    await updatePet({root,asOf:'2026-10-07',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-07',commits:2}]});
    const files=['pet/data/ledger.json','pet/data/state.json','assets/commitchi.svg'];
    const before=await Promise.all(files.map(f=>readFile(join(root,f),'utf8')));
    await assert.rejects(updatePet({root,asOf:'2026-10-12',owner:'tkv00',fetchDays:async()=>{throw new Error('API down');}}),/API down/);
    await assert.rejects(updatePet({root,asOf:'2026-10-12',owner:'tkv00',fetchDays:async()=>[{date:'2026-10-12',commits:0}]}));
    assert.deepEqual(await Promise.all(files.map(f=>readFile(join(root,f),'utf8'))),before);
  } finally {await rm(root,{recursive:true,force:true});}
});
