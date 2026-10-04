import { z } from 'zod';
const id=z.string().max(80).regex(/^[a-z][a-z0-9-]*$/,'Use lowercase IDs starting with a letter').refine(s=>!['root','canvas-extent'].includes(s)&&!s.startsWith('edge-'),'Reserved internal ID; choose another name');
const text=z.string().trim().min(1).max(3000).refine(s=>!/\/Users\/|\/private\/|-----BEGIN|(?:api[_-]?key|password|secret)\s*[:=]|\b(?:sk-|ghp_|xoxb-)[a-zA-Z0-9-]{12,}/i.test(s),'Potential private data');
const short=text.refine(s=>s.length<=70,'Keep diagram labels under 70 characters');
export const publicUrl=z.string().url().refine(s=>{
  const u=new URL(s);
  return ['https:','mailto:'].includes(u.protocol)&&!u.username&&!u.password&&!/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)&&!u.hostname.endsWith('.local')&&!/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname);
},'Use public HTTPS or mailto URLs without credentials');
const asset=z.string().regex(/^\/assets\/[a-zA-Z0-9._-]+$/,'Use /assets/filename');
const link=z.object({label:text,url:publicUrl}).strict();
const category=z.enum(['Framework','Product','Integration','Workflow','Learning lab']);
export const projectSchema=z.object({id,title:text,category,summary:text,problem:text,contribution:text,status:text,skills:z.array(text).default([]),links:z.array(link).default([]),articleIds:z.array(id).default([]),relatedProjectIds:z.array(id).default([]),image:asset.optional()}).strict();
export const contentSchema=z.object({
  profile:z.object({name:text,initials:z.string().min(1).max(4),title:text,location:text.optional(),tagline:text,summary:text,brandCaption:text,portrait:asset.optional(),portraitAlt:text.optional(),portraitCaption:text.optional(),contactUrl:publicUrl.optional(),links:z.array(link).default([]),focus:z.array(text).default([]),metaTitle:text,metaDescription:text}).strict(),
  settings:z.object({defaultProjectId:id.optional(),defaultArchitectureId:id.optional(),defaultView:z.enum(['stories','map','list']).default('stories')}).strict().default({}),
  copy:z.object({allWorkTitle:text.default('All work'),repositoriesTitle:text.default('Repositories'),workTitle:text,workIntro:text,integrationsTitle:text,writingTitle:text,recognitionTitle:text,experienceTitle:text,experienceIntro:text,experienceNote:text,contactTitle:text,architectureTitle:text}).strict(),
  projects:z.array(projectSchema),
  articles:z.array(z.object({id,title:text,description:text,category:text,publisher:text,url:publicUrl,date:z.string().optional()}).strict()).default([]),
  experience:z.array(z.object({company:text,role:text,period:text,description:text,highlights:z.array(z.object({title:text,description:text}).strict()).optional()}).strict()).default([]),
  recognition:z.array(z.object({publication:text,relationship:z.enum(['featured','referenced','authored']),verifiedOn:z.string().date(),items:z.array(z.object({title:text,context:text,url:publicUrl}).strict()).min(1)}).strict()).default([]),
  repositories:z.array(z.object({title:text,description:text,url:publicUrl}).strict()).default([])
}).strict();
export const iconSchema=z.enum(['server','cloud','browser','database','storage','folder','file','code','user','bot','shield','check','laptop','clock','message','globe']);
const node=z.object({id,title:short,subtitle:short,detail:text,group:id,icon:iconSchema,kind:z.enum(['component','ai','human','storage']).default('component')}).strict();
const group=z.object({id,title:short,subtitle:short.optional(),icon:iconSchema}).strict();
const edge=z.object({from:id,to:id,label:short,optional:z.boolean().default(false),bidirectional:z.boolean().default(false)}).strict();
export const architectureSchema=z.object({id,projectId:id,title:text,category,evidence:text,variants:z.array(z.object({id,title:text,status:z.enum(['conceptual','proposed','implemented-snapshot']),asOf:z.string().date().optional(),note:text,groups:z.array(group).min(1),nodes:z.array(node).min(1),edges:z.array(edge),simulation:z.object({label:text,componentIds:z.array(id).min(1)}).strict().optional()}).strict()).min(1)}).strict();

export function validateAll(input,models){
  const content=contentSchema.parse(input),architectures=models.map(m=>architectureSchema.parse(m));
  const unique=(items,label)=>{if(new Set(items).size!==items.length)throw Error(`Duplicate ${label}`);};
  unique(content.projects.map(p=>p.id),'project ID'); unique(content.articles.map(a=>a.id),'article ID');
  const projectIds=new Set(content.projects.map(p=>p.id));
  for(const p of content.projects){
    for(const related of p.relatedProjectIds)if(!projectIds.has(related))throw Error(`${p.id}: missing related project ${related}`);
    for(const article of p.articleIds)if(!content.articles.some(a=>a.id===article))throw Error(`${p.id}: missing article ${article}`);
  }
  if(content.settings.defaultProjectId&&!projectIds.has(content.settings.defaultProjectId))throw Error('Unknown defaultProjectId');
  unique(architectures.map(a=>a.id),'architecture ID'); unique(architectures.map(a=>a.projectId),'project architecture');
  for(const a of architectures){
    if(!projectIds.has(a.projectId))throw Error(`${a.id}: unknown projectId ${a.projectId}`);
    if(content.projects.find(p=>p.id===a.projectId).category!==a.category)throw Error(`${a.id}: architecture category differs from project`);
    unique(a.variants.map(v=>v.id),`${a.id} variant ID`);
    for(const v of a.variants){
      const context=`${a.id}/${v.id}`;
      unique([...v.nodes.map(n=>n.id),...v.groups.map(g=>g.id)],`${context} component/boundary ID`);
      if(v.status==='implemented-snapshot'&&!v.asOf)throw Error(`${context}: implemented snapshots require asOf`);
      for(const n of v.nodes)if(!v.groups.some(g=>g.id===n.group))throw Error(`${context}: missing boundary ${n.group}`);
      for(const g of v.groups)if(!v.nodes.some(n=>n.group===g.id))throw Error(`${context}: empty boundary ${g.id}`);
      for(const e of v.edges)if(!v.nodes.some(n=>n.id===e.from)||!v.nodes.some(n=>n.id===e.to))throw Error(`${context}: missing connection endpoint ${e.from} -> ${e.to}`);
      for(const n of v.simulation?.componentIds||[])if(!v.nodes.some(node=>node.id===n))throw Error(`${context}: missing simulated component ${n}`);
    }
  }
  if(content.settings.defaultArchitectureId&&!architectures.some(a=>a.id===content.settings.defaultArchitectureId))throw Error('Unknown defaultArchitectureId');
  return {content,architectures};
}
