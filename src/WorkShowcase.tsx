import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, ChevronRight, Github, Layers3 } from 'lucide-react';
import type { z } from 'zod';
import { projectSchema } from './schema.mjs';
import { architectureHref } from './architecture.mjs';
import { architectureFor, content } from './data';

type Project = z.infer<typeof projectSchema>;
type Article = {id: string; title: string; url: string};
type Props = {
  projects: Project[]; active: Project; articles: Article[];
  onSelect: (project: Project) => void; onOpen: (project: Project) => void;
};

export function WorkShowcase({projects, active, articles, onSelect, onOpen}: Props) {
  const index = projects.findIndex(p => p.id === active.id);
  const next = projects[(index + 1) % projects.length];
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const source = active.links.find(l => l.url.startsWith('https://github.com/'));
  const article = articles.find(a => active.articleIds.includes(a.id));
  const related = projects.find(p => active.relatedProjectIds?.includes(p.id));
  const architecture = architectureFor(active.id);
  return <div className="case-layout">
    <aside className="case-index">
      <h2>{content.copy.workTitle}</h2>
      <p className="case-intro">{content.copy.workIntro}</p>
      <label className="mobile-project-select">Project
        <select value={active.id} onChange={e => onSelect(projects.find(p => p.id === e.target.value)!)}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </label>
      <nav className="case-projects" aria-label="Project index">
        {projects.map((p, i) => <button key={p.id} aria-label={`Show ${p.title}`} aria-current={p.id === active.id ? 'true' : undefined} onClick={() => onSelect(p)}>
          <span className="case-index-number">{String(i + 1).padStart(2, '0')}</span>
          <span><strong>{p.title}</strong><small>{p.category}</small></span>
          <ChevronRight size={17} aria-hidden="true"/>
        </button>)}
      </nav>
    </aside>
    <article className="case-study" aria-labelledby="case-title">
      <div className="case-topline"><span className="eyebrow">SELECTED PROJECT / {String(index + 1).padStart(2, '0')} OF {projects.length}</span>
        <div className="case-controls">
          <button aria-label="Previous project" title="Previous project" onClick={() => onSelect(previous)} disabled={projects.length < 2}><ArrowLeft size={19}/></button>
          <button aria-label="Next project" title="Next project" onClick={() => onSelect(next)} disabled={projects.length < 2}><ArrowRight size={19}/></button>
        </div>
      </div>
      <h3 id="case-title" aria-live="polite">{active.title}</h3>
      <p className="case-summary">{active.summary}</p>
      <p className="case-status" data-experimental={/progress|prototype|learning/i.test(active.status)}><span aria-hidden="true"/>{active.status}</p>
      {active.image && <img className="case-product-image" src={active.image} alt={`${active.title} project visual`}/>}
      <div className="case-notes">
        <section><h4>The problem</h4><p>{active.problem}</p></section>
        <section><h4>My contribution</h4><p>{active.contribution}</p></section>
      </div>
      <ul className="case-skills" aria-label="Project skills">{active.skills.map(s => <li key={s}>{s}</li>)}</ul>
      <div className="case-actions">
        {architecture && <a href={architectureHref(architecture.id)}><Layers3 size={18}/> Explore architecture <ArrowUpRight size={14}/></a>}
        <button className="primary-link" onClick={() => onOpen(active)}>View case study <ArrowRight size={17}/></button>
        {source && <a href={source.url} target="_blank" rel="noreferrer"><Github size={18}/> Source <ArrowUpRight size={14}/></a>}
        {article && <a href={article.url} target="_blank" rel="noreferrer" title={article.title}><BookOpen size={18}/> Article <ArrowUpRight size={14}/></a>}
      </div>
      {related && <button className="case-related" onClick={() => onSelect(related)}><Layers3 size={20}/><span><small>RELATED PROJECT</small><strong>{related.title}</strong></span><ArrowRight size={18}/></button>}
      {projects.length > 1 && <button className="case-next" onClick={() => onSelect(next)}><span><small>NEXT PROJECT</small><strong>{next.title}</strong></span><ArrowRight size={20}/></button>}
    </article>
  </div>;
}
