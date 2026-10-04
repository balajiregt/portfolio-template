import { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, BaseEdge, type EdgeProps, type NodeProps, type Node, type Edge } from '@xyflow/react';
import { ArrowLeft, ArrowUpRight, Check, Code2, Copy, Laptop, Network, Server, Cloud, Monitor, Database, HardDrive, Folder, FileText, UserRound, Bot, ShieldCheck, Clock, MessageSquare, Globe, Maximize, Minimize, X } from 'lucide-react';
import { architectureHref, mermaidSource, connectionPorts } from './architecture.mjs';
import { architectures, layouts, content } from './data';
import { Header } from './Header';
import './architecture.css';

const icons={server:Server,cloud:Cloud,browser:Monitor,database:Database,storage:HardDrive,folder:Folder,file:FileText,code:Code2,user:UserRound,bot:Bot,shield:ShieldCheck,check:Check,laptop:Laptop,clock:Clock,message:MessageSquare,globe:Globe};
type IconName=keyof typeof icons;
type ComponentData = {title:string; subtitle:string; detail:string; kind:string; icon:IconName; paused:boolean; selected:boolean};
function ComponentNode({data}:NodeProps<Node<ComponentData>>) {
  const Icon=icons[data.icon];
  return <div className={`architecture-node ${data.kind} ${data.paused?'paused':''} ${data.selected?'selected':''}`}>
    {(['T','R','B','L'] as const).flatMap((side)=>['source','target'].map(type=><Handle key={`${side}-${type}`} type={type as 'source'|'target'} id={`${side}-${type}`} position={({T:Position.Top,R:Position.Right,B:Position.Bottom,L:Position.Left})[side]}/>))}
    <button className="nodrag" aria-label={`Inspect ${data.title}`}><span className={`resource-icon icon-${data.icon}`}><Icon size={38} strokeWidth={1.5}/></span><strong>{data.title}</strong><span>{data.subtitle}</span>{data.paused&&<small>Paused in simulation</small>}</button>
  </div>;
}
function BoundaryNode({data}:NodeProps<Node<{title:string;subtitle:string;icon:IconName}>>){
  const Icon=icons[data.icon];
  return <div className="architecture-boundary"><div><Icon size={21}/><strong>{data.title}</strong></div><span>{data.subtitle}</span></div>;
}
const nodeTypes={component:ComponentNode,boundary:BoundaryNode,extent:()=>null};
type Route={points:{x:number;y:number}[];labelX:number;labelY:number};
function ArchitectureEdge(props:EdgeProps){
  const route=props.data?.route as Route;
  const path=route.points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  return <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} markerStart={props.markerStart} style={props.style} label={props.label} labelX={route.labelX} labelY={route.labelY} labelStyle={props.labelStyle} labelBgStyle={props.labelBgStyle} labelBgPadding={[7,4]} labelBgBorderRadius={10}/>;
}
const edgeTypes={architecture:ArchitectureEdge};
export function Architecture(){
  const slug=location.pathname.split('/').filter(Boolean)[1]||content.settings.defaultArchitectureId||architectures[0]?.id;
  const project=architectures.find(p=>p.id===slug);
  const [mobile]=useState(()=>matchMedia('(max-width:700px)').matches);
  const [expanded,setExpanded]=useState(false);
  const [variantId,setVariant]=useState(project?.variants[0].id||''),[awake,setAwake]=useState(true),[selected,setSelected]=useState(''),[view,setView]=useState<'diagram'|'list'>(()=>mobile?'list':'diagram'),[copy,setCopy]=useState('');
  const variant=project?.variants.find(v=>v.id===variantId)||project?.variants[0];
  const active=variant?.nodes.find(n=>n.id===selected)||variant?.nodes[0];
  const graph=useMemo(()=>{
    if(!variant)return {nodes:[],edges:[]};
    const layout=layouts[`${project!.id}/${variant.id}`];
    const nodes:Node[]=[...variant.groups.map(g=>({id:g.id,type:'boundary',position:layout.nodes[g.id],data:{...g},style:{width:layout.nodes[g.id].width,height:layout.nodes[g.id].height},draggable:false,selectable:false,focusable:false,zIndex:-1})),...variant.nodes.map(n=>({id:n.id,type:'component',position:layout.nodes[n.id],data:{...n,paused:!awake&&!!variant.simulation?.componentIds.includes(n.id),selected:n.id===selected},draggable:false}))];
    // Fit the return routes and labels too, not just the resource rectangles.
    nodes.unshift({id:'canvas-extent',type:'extent',position:{x:-30,y:-30},data:{},style:{width:layout.bounds.width+60,height:layout.bounds.height+90,pointerEvents:'none'},draggable:false,selectable:false,focusable:false,zIndex:-2});
    const edges:Edge[]=variant.edges.map((e,i)=>{
      const ports=connectionPorts(layout,e);
      const emphasized=!selected||e.from===selected||e.to===selected;
      const color=!awake&&variant.simulation?.componentIds.some(id=>id===e.from||id===e.to)?'#d9a35e':'#98b4c1';
      return {id:`edge-${i}`,source:e.from,target:e.to,sourceHandle:`${ports.from}-source`,targetHandle:`${ports.to}-target`,type:'architecture',data:{route:layout.edges[`edge-${i}`]},label:String(i+1),markerEnd:{type:MarkerType.ArrowClosed,color},...(e.bidirectional?{markerStart:{type:MarkerType.ArrowClosed,color}}:{}),style:{stroke:color,strokeWidth:1.6,opacity:emphasized?1:.18,strokeDasharray:e.optional?'6 5':undefined},labelStyle:{fill:'#e8f0f4',fontSize:13,fontWeight:600,opacity:emphasized?1:.25},labelBgStyle:{fill:'#182c36',stroke:'#65838d'},labelBgBorderRadius:10,labelBgPadding:[7,4]};
    });
    return {nodes,edges};
  },[variant,awake,selected]);
  const sleeping=variant?.nodes.filter(n=>variant.simulation?.componentIds.includes(n.id))||[];
  const text=variant?mermaidSource(variant):'';
  async function copySource(){try{await navigator.clipboard.writeText(text);setCopy('Copied');}catch{setCopy('Copy unavailable. Select the source text below.');}}
  return <div className={`architecture-page ${expanded?'architecture-expanded':''}`}>
    <a className="skip" href="#architecture-main">Skip to architecture</a>
    <Header/>
    <main id="architecture-main" className="architecture-main">
      <div className="architecture-heading"><div><span className="eyebrow">INSIDE THE SYSTEMS</span><h1>{content.copy.architectureTitle}</h1></div><a href="/#work"><ArrowLeft size={16}/> Back to work</a></div>
      <div className="architecture-layout"><aside className="architecture-index"><h2>Project library</h2><label className="architecture-mobile-picker">Project<select value={project?.id||''} onChange={e=>location.assign(architectureHref(e.target.value))}>{!project&&<option value="">Select a project</option>}{architectures.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><nav aria-label="Architecture library">{['Framework','Product','Integration','Learning lab','Workflow'].map(category=><div key={category}><h3>{category==='Learning lab'?'Learning labs':`${category}s`}</h3>{architectures.filter(p=>p.category===category).map(p=><a key={p.id} href={architectureHref(p.id)} aria-current={project?.id===p.id?'page':undefined}><Network size={14}/>{p.title}</a>)}</div>)}</nav></aside>
      {!project||!variant?<section className="architecture-not-found"><h2>{architectures.length?'Architecture not found':'No architecture published'}</h2><p>{architectures.length?'Select a project from the library.':'Project stories are available independently of architecture diagrams.'}</p><a href={architectures.length?'/architecture':'/'}>{architectures.length?'Open the library':'Back to portfolio'}</a></section>:<article className="architecture-explorer">
        <div className="architecture-project-title"><div><span className="eyebrow">{project.category}</span><h2>{project.title}</h2></div>{project.projectId&&<a href={`/?project=${project.projectId}#work`}>Project story <ArrowUpRight size={15}/></a>}</div>
        <div className="architecture-toolbar"><label>Architecture<select value={variant.id} disabled={project.variants.length===1} onChange={e=>{setVariant(e.target.value);setSelected('');setCopy('');}}>{project.variants.map(v=><option value={v.id} key={v.id}>{v.title}</option>)}</select></label><div className="segmented" role="group" aria-label="Architecture view"><button aria-pressed={view==='diagram'} onClick={()=>setView('diagram')}><Network size={15}/> Diagram</button><button aria-pressed={view==='list'} onClick={()=>setView('list')}><Code2 size={15}/> Components</button></div></div>
        {sleeping.length>0&&<div className="architecture-simulation"><label><input type="checkbox" role="switch" checked={awake} onChange={e=>setAwake(e.target.checked)}/><Laptop size={17}/>{variant.simulation?.label}</label><span>Simulation only · no services are changed</span></div>}
        <p className="architecture-status">{variant.status}{variant.asOf?` · Snapshot as of ${variant.asOf}`:''}</p>
        {view==='diagram'?<>
          <div className="architecture-canvas" aria-label={`${project.title} interactive architecture`}>
            <div className="architecture-canvas-actions"><span>COMPONENTS & BOUNDARIES</span><button onClick={()=>setExpanded(!expanded)} aria-label={expanded?'Collapse diagram':'Expand diagram'} title={expanded?'Collapse diagram':'Expand diagram'}>{expanded?<Minimize size={18}/>:<Maximize size={18}/>}</button></div>
            <ReactFlow key={`${project.id}-${variant.id}-${expanded}`} nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{padding:.08}} minZoom={.15} maxZoom={2} nodesDraggable={false} nodesConnectable={false} edgesFocusable={false} deleteKeyCode={null} onPaneClick={()=>setSelected('')} onNodeClick={(_,n)=>{if(n.type==='component')setSelected(n.id);}}><Background gap={24} color="#31424b"/><Controls showInteractive={false}/></ReactFlow>
          </div>
          <ol className="architecture-connections" aria-label="Component connections">{variant.edges.map((e,i)=><li key={`${e.from}-${e.to}-${i}`} className={selected&&e.from!==selected&&e.to!==selected?'muted':''}><span>{i+1}</span><div><strong>{e.label}{e.optional?' (optional)':''}</strong><small>{variant.nodes.find(n=>n.id===e.from)?.title} {e.bidirectional?'↔':'→'} {variant.nodes.find(n=>n.id===e.to)?.title}</small></div></li>)}</ol>
        </>:<ol className="architecture-components">{variant.nodes.map(n=><li key={n.id}><button aria-pressed={n.id===active?.id} onClick={()=>setSelected(n.id)}><strong>{n.title}</strong><span>{n.subtitle}</span><small>{variant.groups.find(g=>g.id===n.group)?.title}{!awake&&variant.simulation?.componentIds.includes(n.id)?' · Unavailable in simulation':''}</small></button><ul>{variant.edges.filter(e=>e.from===n.id||e.bidirectional&&e.to===n.id).map(e=><li key={`${e.from}-${e.to}-${e.label}`}>{e.label} {e.bidirectional?'↔':'→'} {variant.nodes.find(node=>node.id===(e.from===n.id?e.to:e.from))?.title}{e.optional?' (optional)':''}</li>)}</ul></li>)}</ol>}
        {sleeping.length>0&&<div className="architecture-outcome" aria-live="polite">{!awake?`Simulated unavailable: ${sleeping.map(n=>n.title).join(', ')}. Highlighted connections may be affected; downstream behavior is not inferred.`:'All selected components are available in this simulation. This is not a live health check.'}</div>}
        <section className="architecture-inspector" aria-live="polite"><span className="eyebrow">{variant.groups.find(g=>g.id===active?.group)?.title} / COMPONENT DETAIL</span>{selected&&<button aria-label="Clear component selection" title="Clear component selection" onClick={()=>setSelected('')}><X size={16}/></button>}<h3>{active?.title}</h3><p>{active?.detail}</p></section>
        <p className="architecture-note">{variant.note}</p>
        <details className="architecture-source"><summary>Mermaid source · selected architecture</summary><button className="architecture-copy" onClick={copySource} aria-label="Copy Mermaid source" title="Copy Mermaid source">{copy==='Copied'?<Check size={17}/>:<Copy size={17}/>}</button><span role="status">{copy}</span><pre><code>{text}</code></pre></details>
        <details className="architecture-evidence"><summary>Scope & evidence</summary><p>{project.evidence}</p><p>The interactive canvas and Mermaid architecture-beta export share the same components, boundaries and connections. Mermaid lays out its own export; connection descriptions are preserved as source comments. Boundaries do not imply network or security isolation.</p></details>
      </article>}</div>
    </main>
  </div>;
}
