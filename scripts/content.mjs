import { readdirSync,readFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { validateAll } from '../src/schema.mjs';
export function readContent(root=resolve('content')){
  const portfolio=JSON.parse(readFileSync(join(root,'portfolio.json'),'utf8'));
  const architectures=readdirSync(join(root,'architectures')).filter(n=>n.endsWith('.json')).sort().map(n=>{
    try{return JSON.parse(readFileSync(join(root,'architectures',n),'utf8'));}catch(error){throw Error(`${n}: ${error.message}`);}
  });
  return validateAll(portfolio,architectures);
}
