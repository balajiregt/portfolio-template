import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ReactFlow,Background,Controls,Handle,Position,type NodeProps,type Node} from '@xyflow/react';
import {ArrowUpRight,BookOpen,List,Network,X,Layers3} from 'lucide-react';
import type {z} from 'zod';
import {projectSchema} from './schema.mjs';
import {content,architectureFor} from './data';
import {architectureHref} from './architecture.mjs';
import {Architecture} from './ArchitectureExplorer';
import {Header} from './Header';
import {WorkShowcase} from './WorkShowcase';
import {WritingRecognition} from './WritingRecognition';
import '@xyflow/react/dist/style.css';
import './style.css';
import './showcase.css';
import './template.css';

type Project=z.infer<typeof projectSchema>;
type MapData={title:string;kind:string;activate:()=>void};
function MapNode({data}:NodeProps<Node<MapData>>){return <div className={`map-node ${data.kind}`}><Handle type="target" position={Position.Left}/><small className="node-kind">{data.kind}</small><button className="node-open nodrag" onClick={data.activate}>{data.title}</button><Handle type="source" position={Position.Right}/></div>;}
const nodeTypes={portfolio:MapNode};
function ProjectMap({onSelect}:{onSelect:(p:Project)=>void}){
  const [detail,setDetail]=useState('');
  const nodes:Node<MapData>[]=[],edges:{id:string;source:string;target:string}[]=[];
  const skills=[...new Set(content.projects.flatMap(p=>p.skills))];
  content.projects.forEach((p,i)=>{nodes.push({id:`p-${p.id}`,type:'portfolio',position:{x:20,y:i*150},data:{title:p.title,kind:p.category.toLowerCase(),activate:()=>onSelect(p)}});
    p.skills.forEach(s=>edges.push({id:`${p.id}-${skills.indexOf(s)}`,source:`p-${p.id}`,target:`s-${skills.indexOf(s)}`}));
    p.articleIds.forEach(a=>edges.push({id:`${p.id}-article-${a}`,source:`p-${p.id}`,target:`a-${a}`}));
  });
  skills.forEach((s,i)=>nodes.push({id:`s-${i}`,type:'portfolio',position:{x:370,y:i*105},data:{title:s,kind:'skill',activate:()=>setDetail(`${s}: ${content.projects.filter(p=>p.skills.includes(s)).map(p=>p.title).join(', ')}`)}}));
  content.articles.forEach((a,i)=>nodes.push({id:`a-${a.id}`,type:'portfolio',position:{x:700,y:i*140},data:{title:a.title,kind:'article',activate:()=>{window.open(a.url,'_blank','noopener,noreferrer');}}}));
  return <><div className="project-map"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} deleteKeyCode={null} fitView minZoom={.2} maxZoom={2}><Background/><Controls showInteractive={false}/></ReactFlow></div><p className="map-status" aria-live="polite">{detail}</p></>;
}
function Portfolio(){
  const {profile,projects,copy,articles,experience,repositories}=content;
  const query=new URLSearchParams(location.search).get('project');
  const [active,setActive]=useState(projects.find(p=>p.id===(query||content.settings.defaultProjectId))||projects[0]);
  const [view,setView]=useState<'stories'|'map'|'list'>(content.settings.defaultView);
  const [opened,setOpened]=useState<Project>();
  const dialog=useRef<HTMLDialogElement>(null);
  const select=(p:Project)=>{setActive(p);history.replaceState(null,'',`?project=${p.id}#work`);};
  const open=(p:Project)=>{setOpened(p);dialog.current?.showModal();};
  return <><a className="skip" href="#main">Skip to content</a><Header/><main id="main">
    <section className="intro page-width"><div className="intro-meta">{profile.title}{profile.location?` | ${profile.location}`:''}</div><div className={`intro-line ${profile.portrait?'with-art':''}`}><div><h1>{profile.name}</h1><p className="intro-focus">{profile.tagline}</p><p className="intro-copy">{profile.summary}</p><div className="intro-links">{profile.links.map(l=><a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label}<ArrowUpRight size={16}/></a>)}{profile.contactUrl&&<a className="primary-link" href={profile.contactUrl}>Connect <ArrowUpRight size={16}/></a>}</div></div>{profile.portrait&&<figure className="sample-art"><img src={profile.portrait} alt={profile.portraitAlt||profile.name}/>{profile.portraitCaption&&<figcaption>{profile.portraitCaption}</figcaption>}</figure>}</div>{profile.focus.length>0&&<div className="focus-strip">{profile.focus.map(f=><span key={f}><Layers3 size={16}/>{f}</span>)}</div>}</section>
    {active&&projects.length>0&&<section id="work" className="work-band"><div className="page-width"><div className="section-head"><h2>{copy.allWorkTitle}</h2><div className="segmented" role="group" aria-label="Project view">{(['stories','map','list'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='stories'?<BookOpen size={16}/>:v==='map'?<Network size={16}/>:<List size={16}/>} {v[0].toUpperCase()+v.slice(1)}</button>)}</div></div>
      {view==='stories'?<WorkShowcase projects={projects} active={active} articles={articles} onSelect={select} onOpen={open}/>:view==='map'?<ProjectMap onSelect={p=>{select(p);open(p);}}/>:<div className="project-list">{projects.map(p=><article key={p.id}><span className="eyebrow">{p.category} / {p.status}</span><h3><button onClick={()=>open(p)}>{p.title}</button></h3><p>{p.summary}</p>{architectureFor(p.id)&&<a className="architecture-link" href={architectureHref(architectureFor(p.id)!.id)}>Architecture <ArrowUpRight size={16}/></a>}</article>)}</div>}
    </div></section>}
    {articles.length>0&&<section id="writing" className="page-width writing"><h2>{copy.writingTitle}</h2>{articles.map(a=><a className="article-row" href={a.url} key={a.id} target="_blank" rel="noreferrer"><span className="article-publisher">{a.publisher}<small>{a.date}</small></span><div><h3>{a.title}</h3><p>{a.description}</p></div><ArrowUpRight size={20}/></a>)}</section>}
    {content.recognition.length>0&&<div className="page-width recognition-band"><WritingRecognition groups={content.recognition} title={copy.recognitionTitle}/></div>}
    {experience.length>0&&<section id="experience" className="experience-band"><div className="page-width"><h2>{copy.experienceTitle}</h2><p>{copy.experienceIntro}</p>{experience.map((e,i)=><article className="experience-entry" key={i}><h3>{e.role}</h3><p>{e.company} | {e.period}</p><p>{e.description}</p>{e.highlights?.length&&<details><summary>Contributions</summary><ul className="experience-highlights">{e.highlights.map(h=><li key={h.title}><h4>{h.title}</h4><p>{h.description}</p></li>)}</ul></details>}</article>)}<p>{copy.experienceNote}</p></div></section>}
    {repositories.length>0&&<section className="page-width"><h2>{copy.repositoriesTitle}</h2><div className="repo-list">{repositories.map(r=><a href={r.url} key={r.url}>{r.title}<small>{r.description}</small><ArrowUpRight size={16}/></a>)}</div></section>}
  </main><footer className="page-width"><div className="footer-line"><h2>{copy.contactTitle}</h2>{profile.contactUrl&&<a className="primary-link" href={profile.contactUrl}>Connect <ArrowUpRight size={16}/></a>}</div><div className="footer-bottom"><span>{profile.name}</span><span>{profile.title}</span></div></footer>
  <dialog ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}} aria-labelledby="detail-title"><button className="close-button" aria-label="Close project" title="Close project" onClick={()=>dialog.current?.close()}><X/></button>{opened&&<div className="dialog-content"><span className="eyebrow">{opened.category} / {opened.status}</span><h2 id="detail-title">{opened.title}</h2><p>{opened.summary}</p><h3>Problem</h3><p>{opened.problem}</p><h3>Contribution</h3><p>{opened.contribution}</p><div className="dialog-links">{opened.links.map(l=><a href={l.url} key={l.url} target="_blank" rel="noreferrer">{l.label}<ArrowUpRight size={16}/></a>)}{architectureFor(opened.id)&&<a href={architectureHref(architectureFor(opened.id)!.id)}>Architecture <ArrowUpRight size={16}/></a>}</div></div>}</dialog></>;
}
createRoot(document.getElementById('root')!).render(location.pathname.startsWith('/architecture')?<Architecture/>:<Portfolio/>);
