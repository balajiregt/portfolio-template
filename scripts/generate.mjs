import ELK from 'elkjs/lib/elk.bundled.js';
import { mkdir,writeFile,access } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { readContent } from './content.mjs';

const root=resolve(process.env.PORTFOLIO_CONTENT_DIR||'content');
const {content,architectures}=readContent(root);
for(const image of [content.profile.portrait,...content.projects.map(p=>p.image)].filter(Boolean))await access(join('public',image));
if(process.argv.includes('--check')){console.log(`Valid: ${content.projects.length} projects, ${architectures.length} architectures.`);process.exit(0);}
const elk=new ELK(),layouts={};
for(const a of architectures)for(const v of a.variants){
  const graph=await elk.layout({id:'root',layoutOptions:{'elk.algorithm':'layered','elk.direction':'RIGHT','elk.hierarchyHandling':'INCLUDE_CHILDREN','elk.edgeRouting':'ORTHOGONAL','elk.spacing.nodeNode':'55','elk.layered.spacing.nodeNodeBetweenLayers':'90','elk.spacing.edgeNode':'30','elk.padding':'[top=20,left=20,bottom=20,right=20]'},children:v.groups.map(g=>({id:g.id,layoutOptions:{'elk.padding':'[top=85,left=30,bottom=35,right=30]','elk.nodeSize.minimum':'(290,260)','elk.nodeSize.constraints':'MINIMUM_SIZE'},children:v.nodes.filter(n=>n.group===g.id).map(n=>({id:n.id,width:210,height:160}))})),edges:v.edges.map((e,i)=>({id:`edge-${i}`,sources:[e.from],targets:[e.to],labels:[{text:String(i+1),width:22,height:22}]}))});
  const nodes={},edges={},pending=[];
  function collect(item,x=0,y=0){const px=x+(item.x||0),py=y+(item.y||0);if(item.id!=='root')nodes[item.id]={x:px,y:py,width:item.width,height:item.height};pending.push(...item.edges||[]);for(const child of item.children||[])collect(child,px,py);}
  collect(graph);
  for(const e of pending){
    const o=e.container==='root'?{x:0,y:0}:nodes[e.container],s=e.sections?.[0],label=e.labels?.[0];
    if(!o||!s)throw Error(`Missing edge route: ${a.id}/${v.id}/${e.id}`);
    edges[e.id]={points:[s.startPoint,...s.bendPoints||[],s.endPoint].map(p=>({x:p.x+o.x,y:p.y+o.y})),labelX:(label?.x||s.startPoint.x)+o.x+11,labelY:(label?.y||s.startPoint.y)+o.y+11};
  }
  layouts[`${a.id}/${v.id}`]={nodes,edges,bounds:{width:graph.width,height:graph.height}};
}
await mkdir('src/generated',{recursive:true});
await writeFile('src/generated/data.json',JSON.stringify({content,architectures,layouts},null,2)+'\n');
console.log(`Generated ${Object.keys(layouts).length} architecture layouts from ${root}.`);
