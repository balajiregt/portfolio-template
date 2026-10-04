import {ArrowUpRight,ChevronDown} from 'lucide-react';

type Recognition={publication:string;relationship:'featured'|'referenced'|'authored';verifiedOn:string;items:{title:string;context:string;url:string}[]};
const labels={featured:'Featured in',referenced:'Referenced in',authored:'Published on'};

export function WritingRecognition({groups,title}:{groups:Recognition[];title:string}){
  if(!groups.length)return null;
  return <section id="recognition" className="writing-recognition" aria-labelledby="recognition-title">
    <h3 id="recognition-title">{title}</h3>
    <div className="recognition-publications">{groups.map(group=><details name="writing-recognition" key={group.publication}>
      <summary><span><small>{labels[group.relationship]}</small><strong>{group.publication}</strong></span><ChevronDown size={17} aria-hidden="true"/></summary>
      <ul>{group.items.map(item=><li key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer"><span><small>{item.context}</small>{item.title}</span><ArrowUpRight size={16} aria-hidden="true"/></a></li>)}</ul>
    </details>)}</div>
  </section>;
}
