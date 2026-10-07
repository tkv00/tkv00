import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLedger,mergeDays,projectPet} from './engine.mjs';
import {fetchCommitDays} from './github.mjs';
import {renderPet} from './render.mjs';

const defaultRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const DAY=86_400_000;
const json=value=>`${JSON.stringify(value,null,2)}\n`;

export async function updatePet({root=defaultRoot,owner='tkv00',asOf=new Date().toISOString().slice(0,10),token,includePrivate=false,excludeRepository=`${owner}/${owner}`,fetchDays=fetchCommitDays}={}) {
  const ledgerPath=join(root,'pet/data/ledger.json');
  let ledger;
  try {ledger=JSON.parse(await readFile(ledgerPath,'utf8'));}
  catch(error) {if(error.code!=='ENOENT') throw error;ledger=createLedger(owner,asOf);}
  if(ledger.owner!==owner) throw new Error('Pet owner mismatch; state preserved');
  const source={kind:'github-commit-contributions',includePrivate,excludeRepository,dayBasis:'occurredAt-utc-date'};
  if(ledger.source && JSON.stringify(ledger.source)!==JSON.stringify(source)) throw new Error('Contribution source changed; review it before updating this pet');
  const last=ledger.days.at(-1)?.date ?? ledger.adoptedOn;
  const from=[ledger.adoptedOn,new Date(Date.parse(`${last}T00:00:00Z`)-7*DAY).toISOString().slice(0,10)].sort().at(-1);
  // Fetch and validate the entire catch-up before mutating any stored artifact.
  const observations=await fetchDays({owner,token,from,to:asOf,includePrivate,excludeRepository});
  const next={...mergeDays(ledger,observations,asOf),source};
  const state=projectPet(next,{asOf});
  const outputs=[['pet/data/ledger.json',json(next)],['pet/data/state.json',json(state)],['assets/commitchi.svg',renderPet(state,{owner})]];
  // A workflow publishes all three files in one Git commit. Temporary writes
  // protect individual files from truncation; no API result is written raw.
  for(const [path,content] of outputs) {
    const target=join(root,path);await mkdir(dirname(target),{recursive:true});
    await writeFile(`${target}.tmp`,content,'utf8');
  }
  for(const [path] of outputs) await rename(join(root,`${path}.tmp`),join(root,path));
  return state;
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const owner=process.env.PET_OWNER || process.env.GITHUB_REPOSITORY_OWNER || 'tkv00';
    const state=await updatePet({owner,token:process.env.PET_GITHUB_TOKEN || process.env.GITHUB_TOKEN,includePrivate:process.env.PET_INCLUDE_PRIVATE==='true',excludeRepository:process.env.GITHUB_REPOSITORY || `${owner}/${owner}`});
    console.log(`COMMITCHI · GEN ${state.generation} · LV ${state.level} · ${state.status} · ${state.totalCommits} commits`);
  } catch(error) {console.error(`COMMITCHI update stopped: ${error.message}`);process.exitCode=1;}
}
