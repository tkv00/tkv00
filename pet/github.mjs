const DAY = 86_400_000;

function dateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) throw new Error('Invalid date');
  const ms=Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0,10)!==value) throw new Error('Invalid date');
  return ms;
}

function range(from,to) {
  const start=dateValue(from),end=dateValue(to);
  if(end<start || (end-start)/DAY>3660) throw new Error('Invalid date range');
  return Array.from({length:(end-start)/DAY+1},(_,i)=>new Date(start+i*DAY).toISOString().slice(0,10));
}

export function parseCommitDays(payload,{from,to,excludeRepository='',includePrivate=false}) {
  const dates=range(from,to), counts=new Map(dates.map(d=>[d,0]));
  if(payload?.errors?.length) throw new Error('GitHub GraphQL returned errors; pet state preserved');
  const c=payload?.data?.user?.contributionsCollection;
  if(!c || !Number.isSafeInteger(c.totalCommitContributions) || c.totalCommitContributions<0 || !Array.isArray(c.commitContributionsByRepository)) throw new Error('Invalid GitHub response');
  let seenTotal=0;
  const repos=new Set();
  for(const item of c.commitContributionsByRepository) {
    const repo=item?.repository,connection=item?.contributions;
    if(!repo || typeof repo.nameWithOwner!=='string' || typeof repo.isPrivate!=='boolean' || repos.has(repo.nameWithOwner.toLowerCase())) throw new Error('Invalid or duplicate repository');
    repos.add(repo.nameWithOwner.toLowerCase());
    if(connection?.pageInfo?.hasNextPage!==false) throw new Error('Incomplete pagination; pet state preserved');
    if(!Array.isArray(connection.nodes)) throw new Error('Invalid contribution rows');
    const daysSeen=new Set();
    for(const row of connection.nodes) {
      const date=typeof row.occurredAt==='string'?row.occurredAt.slice(0,10):'';
      dateValue(date);
      if(!counts.has(date) || daysSeen.has(date) || !Number.isFinite(Date.parse(row.occurredAt)) || !Number.isSafeInteger(row.commitCount) || row.commitCount<0) throw new Error('Invalid contribution day or count');
      daysSeen.add(date); seenTotal+=row.commitCount;
      if((includePrivate || !repo.isPrivate) && repo.nameWithOwner.toLowerCase()!==excludeRepository.toLowerCase()) counts.set(date,counts.get(date)+row.commitCount);
    }
  }
  if(!Number.isSafeInteger(seenTotal) || seenTotal!==c.totalCommitContributions) throw new Error('Incomplete commit totals; pet state preserved');
  return [...counts].map(([date,commits])=>({date,commits}));
}

const QUERY=`query Commitchi($owner:String!,$from:DateTime!,$to:DateTime!){
  user(login:$owner){contributionsCollection(from:$from,to:$to){
    totalCommitContributions
    commitContributionsByRepository(maxRepositories:100){
      repository{nameWithOwner isPrivate}
      contributions(first:100){pageInfo{hasNextPage} nodes{occurredAt commitCount}}
    }
  }}
}`;

export async function fetchCommitDays({owner,token,from,to,excludeRepository='',includePrivate=false,fetchImpl=fetch}) {
  if(!token) throw new Error('GitHub token is required; pet state preserved');
  if(!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(owner ?? '')) throw new Error('Invalid GitHub owner');
  const dates=range(from,to),result=[];
  for(let i=0;i<dates.length;i+=14) {
    const start=dates[i],end=dates[Math.min(i+13,dates.length-1)];
    const response=await fetchImpl('https://api.github.com/graphql',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,'User-Agent':'Commitchi-README-pet'},
      body:JSON.stringify({query:QUERY,variables:{owner,from:`${start}T00:00:00Z`,to:`${end}T23:59:59Z`}}),
      signal:AbortSignal.timeout(30_000)
    });
    if(!response.ok) throw new Error(`GitHub HTTP ${response.status}; pet state preserved`);
    result.push(...parseCommitDays(await response.json(),{from:start,to:end,excludeRepository,includePrivate}));
  }
  return result;
}
