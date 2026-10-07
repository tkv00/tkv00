import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCommitDays, fetchCommitDays} from './github.mjs';

const collection = (repos, total = repos.reduce((n,r)=>n+r.contributions.nodes.reduce((s,d)=>s+d.commitCount,0),0)) => ({data:{user:{contributionsCollection:{totalCommitContributions:total,commitContributionsByRepository:repos}}}});
const repo = (name, isPrivate, rows) => ({repository:{nameWithOwner:name,isPrivate}, contributions:{pageInfo:{hasNextPage:false},nodes:rows.map(([date,commitCount])=>({occurredAt:`${date}T07:00:00Z`,commitCount}))}});
const options = {from:'2026-10-06',to:'2026-10-08',excludeRepository:'tkv00/tkv00',includePrivate:false};

test('counts commits, fills confirmed empty days, excludes profile automation and private repositories',()=>{
  const payload=collection([repo('tkv00/project',false,[['2026-10-07',3]]),repo('tkv00/tkv00',false,[['2026-10-07',20]]),repo('tkv00/secret',true,[['2026-10-08',4]])]);
  assert.deepEqual(parseCommitDays(payload,options),[{date:'2026-10-06',commits:0},{date:'2026-10-07',commits:3},{date:'2026-10-08',commits:0}]);
  assert.equal(parseCommitDays(payload,{...options,includePrivate:true})[2].commits,4);
});
test('fails closed on GraphQL errors, pagination and incomplete totals instead of fabricating starvation',()=>{
  assert.throws(()=>parseCommitDays({errors:[{message:'forbidden'}]},options));
  assert.throws(()=>parseCommitDays(collection([repo('a/b',false,[['2026-10-07',1]])],2),options),/incomplete/i);
  const p=collection([repo('a/b',false,[['2026-10-07',1]])]);
  p.data.user.contributionsCollection.commitContributionsByRepository[0].contributions.pageInfo.hasNextPage=true;
  assert.throws(()=>parseCommitDays(p,options),/pagination/i);
  assert.throws(()=>parseCommitDays({data:{user:null}},options));
});
test('invalid counts, dates, duplicate rows and repository identities are rejected',()=>{
  for(const count of [-1,1.5,'2',NaN]) assert.throws(()=>parseCommitDays(collection([repo('a/b',false,[['2026-10-07',count]])]),options));
  assert.throws(()=>parseCommitDays(collection([repo('a/b',false,[['2026-10-09',2]])]),options));
  assert.throws(()=>parseCommitDays(collection([repo('a/b',false,[['2026-10-07',1],['2026-10-07',1]])]),options));
  assert.throws(()=>parseCommitDays(collection([]),{...options,from:'2026-02-30'}));
});
test('query uses bounded inclusive day ranges and splits long catch-up without overlapping dates',async()=>{
  const requests=[];
  const rows=await fetchCommitDays({owner:'tkv00',token:'test-only',from:'2026-10-01',to:'2026-10-16',fetchImpl:async(url,init)=>{
    requests.push(JSON.parse(init.body));return new Response(JSON.stringify(collection([])),{status:200});
  }});
  assert.equal(requests.length,2);assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(d=>d.date)).size,16);
  assert.equal(requests[0].variables.from,'2026-10-01T00:00:00Z');
  assert.equal(requests[0].variables.to,'2026-10-14T23:59:59Z');
  assert.equal(requests[1].variables.from,'2026-10-15T00:00:00Z');
});
test('HTTP failures and absent tokens abort collection',async()=>{
  await assert.rejects(fetchCommitDays({owner:'tkv00',token:'',...options}),/token/i);
  await assert.rejects(fetchCommitDays({owner:'tkv00',token:'test-only',...options,fetchImpl:async()=>new Response('denied',{status:403})}),/403/);
});
