import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readContent } from './scripts/content.mjs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export default defineConfig({build:{rollupOptions:{output:{manualChunks:{'graph-vendor':['@xyflow/react']}}}},plugins:[react(),{
  name:'portfolio-content',
  transformIndexHtml(html){const {profile}=readContent(resolve(process.env.PORTFOLIO_CONTENT_DIR||'content')).content;return html.replace('<!--portfolio-meta-->',`<title>${escape(profile.metaTitle)}</title><meta name="description" content="${escape(profile.metaDescription)}"/><meta property="og:title" content="${escape(profile.metaTitle)}"/><meta property="og:description" content="${escape(profile.metaDescription)}"/>`);},
  configureServer(server){
    const root=resolve(process.env.PORTFOLIO_CONTENT_DIR||'content');
    server.watcher.add(root);
    server.watcher.on('all',(event,file)=>{
      if(!['add','change','unlink'].includes(event)||!file.startsWith(root+'/'))return;
      try{execFileSync(process.execPath,['scripts/generate.mjs']);server.ws.send({type:'full-reload'});}
      catch(error){console.error('Content validation failed:',String(error));server.ws.send({type:'error',err:{message:'Content validation failed. Check the terminal for the affected file.',stack:''}});}
    });
  }
}]});
