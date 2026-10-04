import {content,architectures} from './data';
export function Header(){
  const {profile,articles,experience,projects}=content;
  return <header className="topbar"><a className="brand" href="/"><span className="brand-mark">{profile.initials}<span>.</span></span><span>{profile.name}<small>{profile.brandCaption}</small></span></a><nav aria-label="Main">
    {projects.length>0&&<a href="/#work">Work</a>}
    {architectures.length>0&&<a href="/architecture">Architecture</a>}
    {articles.length>0&&<a href="/#writing">Writing</a>}
    {experience.length>0&&<a href="/#experience">Experience</a>}
  </nav></header>;
}
