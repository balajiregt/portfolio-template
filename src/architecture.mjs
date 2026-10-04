export const architectureHref=id=>`/architecture/${encodeURIComponent(id)}`;
export function connectionPorts(layout,e){
  const a=layout.nodes[e.from],b=layout.nodes[e.to];
  return a.x!==b.x?(a.x<b.x?{from:'R',to:'L'}:{from:'L',to:'R'}):(a.y<b.y?{from:'B',to:'T'}:{from:'T',to:'B'});
}
export function mermaidSource(v){
  // Prefixes keep component IDs disjoint from Mermaid keywords and group IDs.
  const key=id=>'n_'+id.replaceAll('-','_');
  const label=s=>s.replace(/[^a-zA-Z0-9 ]/g,' ').replace(/ +/g,' ').trim()||'Component';
  const symbol=n=>n.icon==='database'?'database':['storage','folder','file'].includes(n.icon)?'disk':['cloud','globe'].includes(n.icon)?'cloud':n.icon==='browser'?'internet':'server';
  return ['architecture-beta',`    %% ${v.status}${v.asOf?' '+v.asOf:''}`,'    %% Logical boundaries are not security isolation guarantees.',...v.groups.map(g=>`    group ${key(g.id)}(cloud)[${label(g.title)}]`),...v.nodes.map(n=>`    service ${key(n.id)}(${symbol(n)})[${label(n.title)}] in ${key(n.group)}`),...v.edges.flatMap(e=>[`    %% ${e.label.replace(/[\r\n]/g,' ')}${e.optional?' (optional)':''}`,`    ${key(e.from)}:R ${e.bidirectional?'<-->':'-->'} L:${key(e.to)}`])].join('\n');
}
