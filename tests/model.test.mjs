import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readContent} from '../scripts/content.mjs';
import {validateAll} from '../src/schema.mjs';
import {mermaidSource} from '../src/architecture.mjs';
const fresh=()=>structuredClone(readContent());
test('three fictional presets and export',()=>{const {content,architectures}=fresh();assert.equal(content.projects.length,3);assert.equal(architectures.length,3);for(const a of architectures)assert.match(mermaidSource(a.variants[0]),/^architecture-beta/);});
test('optional collections and architectures can be empty',()=>{const {content}=fresh();content.projects=[];content.settings={};validateAll(content,[]);});
for(const [name,mutate,pattern] of [
 ['duplicate project',c=>c.content.projects.push(c.content.projects[0]),/Duplicate project/],
 ['duplicate component',c=>c.architectures[0].variants[0].nodes.push(c.architectures[0].variants[0].nodes[0]),/Duplicate/],
 ['missing endpoint',c=>c.architectures[0].variants[0].edges[0].to='missing',/missing connection endpoint/],
 ['missing project',c=>c.architectures[0].projectId='unknown',/unknown projectId/],
 ['unsafe URL',c=>c.content.profile.links[0].url='javascript:alert(1)',/public HTTPS/],
 ['private URL',c=>c.content.profile.links[0].url='https://127.0.0.1/private',/public HTTPS/],
 ['credential URL',c=>c.content.profile.links[0].url='https://user:pass@example.com',/public HTTPS/],
 ['unsupported icon',c=>c.architectures[0].variants[0].nodes[0].icon='unknown',/Invalid enum/],
 ['missing boundary',c=>c.architectures[0].variants[0].nodes[0].group='unknown',/missing boundary/],
 ['reserved IDs',c=>c.architectures[0].variants[0].nodes[0].id='root',/Reserved internal/],
 ['undated implementation',c=>c.architectures[0].variants[0].status='implemented-snapshot',/require asOf/],
 ['private path',c=>c.content.profile.summary='/Users/someone/private',/Potential private data/],
 ['arbitrary layout coordinates',c=>c.architectures[0].variants[0].nodes[0].x=100,/Unrecognized key/],
 ['unknown selection',c=>c.content.settings.defaultArchitectureId='missing',/Unknown defaultArchitectureId/],
 ['missing article',c=>c.content.projects[0].articleIds=['missing'],/missing article/],
 ['invalid simulation',c=>c.architectures[0].variants[0].simulation={label:'Example',componentIds:['missing']},/missing simulated component/]
])test(name,()=>{const c=fresh();mutate(c);assert.throws(()=>validateAll(c.content,c.architectures),pattern);});
