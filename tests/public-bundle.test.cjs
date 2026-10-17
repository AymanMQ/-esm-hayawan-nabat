const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {files}=require('../scripts/build-public.cjs');
test('public bundle allowlist contains only expected static files',()=>{
 const allow=new Set(files);
 assert.equal(allow.size,files.length);
 for(const f of files){
   assert.ok(!f.startsWith('functions/')&&!f.startsWith('tests/')&&!f.startsWith('.github/'),f);
   assert.ok(fs.existsSync(path.join(__dirname,'..',f)),f);
 }
 for(const sensitive of ['database.secure.rules.json','SECURITY.md','functions/index.js','functions/rooms.js','.gitignore']){
   assert.ok(!allow.has(sensitive),sensitive);
 }
});
