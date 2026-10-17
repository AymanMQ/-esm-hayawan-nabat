// Build a minimal, explicitly allowlisted GitHub Pages artifact.
// Does NOT deploy or change the repository's visibility.
import {mkdir,copyFile,rm,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'public-dist');
export const PUBLIC_FILES=[
 'index.html','multiplayer.html','language-challenge.html','my-words.html','tournaments.html',
 'notebook-theme.css','notebook-fonts.css','home.css','play-hud.css',
 'game-nav.css','game-navigation.css',
 'home.js','solo-challenge.js','multiplayer-client.js','tournament-preview.js',
 'firebase-config.js',
 'game/answer-bank.js','game/discovery.js','game/solo-rules.js','game/solo-match.js',
 'game/categories.js','game/language-questions.js','game/word-learning.js',
 'game/tournament-schedule.js','game/tournament-bracket.js'
];
if(new Set(PUBLIC_FILES).size!==PUBLIC_FILES.length)throw Error('Duplicate public files');
for(const file of PUBLIC_FILES){
 if(file.startsWith('/')||file.includes('..')||path.isAbsolute(file))throw Error('Unsafe path: '+file);
 const full=path.resolve(root,file);
 if(!full.startsWith(root+path.sep))throw Error('Outside project: '+file);
 const metadata=await stat(full);
 if(!metadata.isFile())throw Error('Not a file: '+file);
}
await rm(output,{recursive:true,force:true});
for(const file of PUBLIC_FILES){
 const dest=path.join(output,file);
 await mkdir(path.dirname(dest),{recursive:true});
 await copyFile(path.join(root,file),dest);
}
await writeFile(path.join(output,'.nojekyll'),'');
console.log('Prepared '+PUBLIC_FILES.length+' public frontend files in public-dist (no server source).');
