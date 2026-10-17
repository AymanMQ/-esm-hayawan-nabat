'use strict';
// Public Pages bundle: an explicit allowlist is safer than publishing the repository root.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const files=[
 'index.html','multiplayer.html','language-challenge.html','my-words.html','tournaments.html',
 'notebook-theme.css','notebook-fonts.css','home.css','play-hud.css',
 'game-nav.css','game-navigation.css',
 'home.js','solo-challenge.js','multiplayer-client.js','tournament-preview.js','firebase-config.js',
 'game/answer-bank.js','game/discovery.js','game/solo-rules.js','game/solo-match.js',
 'game/categories.js','game/language-questions.js','game/word-learning.js',
 'game/tournament-schedule.js','game/tournament-bracket.js'
];
const allow=new Set(files);
function build(){
 fs.rmSync(out,{recursive:true,force:true});
 for(const name of files){
   if(!/^[a-zA-Z0-9._/-]+$/.test(name)||name.includes('..')||name.startsWith('/'))throw Error('Unsafe path '+name);
   const src=path.join(root,name),dst=path.join(out,name);
   if(!fs.existsSync(src)||!fs.statSync(src).isFile())throw Error('Missing public asset '+name);
   fs.mkdirSync(path.dirname(dst),{recursive:true});
   fs.copyFileSync(src,dst);
 }
 fs.writeFileSync(path.join(out,'.nojekyll'),'');
 const html=files.filter(f=>f.endsWith('.html'));
 for(const page of html){
   const source=fs.readFileSync(path.join(out,page),'utf8');
   for(const m of source.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)){
     const value=m[1];
     if(/^(?:https?:|data:|mailto:|#)/i.test(value))continue;
     const asset=value.split(/[?#]/)[0];
     if(!asset||asset==='./')continue;
     const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(page),asset));
     if(!allow.has(resolved))throw Error(page+' references unapproved asset '+value);
   }
 }
 for(const forbidden of ['functions','tests','.git','.github','database.secure.rules.json','SECURITY.md','.env']){
   if(fs.existsSync(path.join(out,forbidden)))throw Error('Private file leaked: '+forbidden);
 }
 return files.length;
}
if(require.main===module)console.log('Built '+build()+' explicitly allowed public files');
module.exports={files,build};
