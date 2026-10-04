import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const entries=[];const texts=[];
for(const path of Object.keys(lock.packages).filter(p=>p.startsWith('node_modules/')).sort()){
  try{
    const p=JSON.parse(await readFile(join(path,'package.json'),'utf8'));
    const files=(await readdir(path)).filter(f=>/^(license|licence|copying|notice)(\.|$|-)/i.test(f));
    entries.push(`| ${p.name} | ${p.version} | ${typeof p.license==='string'?p.license:JSON.stringify(p.license||'See upstream')} |`);
    for(const file of files){try{texts.push(`\n${'='.repeat(72)}\n${p.name}@${p.version} / ${file}\n${'='.repeat(72)}\n${await readFile(join(path,file),'utf8')}`);}catch{}}
  }catch{}
}
await mkdir('public/notices',{recursive:true});
await writeFile('THIRD_PARTY_NOTICES.md','# Dependency notices\n\nGenerated from the installed lockfile. Includes build/test dependencies, not only shipped code. Original code is MIT; third-party code retains its own license. Full available upstream license text is in `public/notices/dependency-licenses.txt`.\n\n| Package | Version | License |\n|---|---|---|\n'+entries.join('\n')+'\n');
await writeFile('public/notices/dependency-licenses.txt',texts.join('\n'));
console.log(`Preserved available license files from ${entries.length} installed dependencies.`);
