const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const controller=fs.readFileSync(path.join(root,'solo-challenge.js'),'utf8');
test('solo dependencies load in order',()=>{
 const dependencies=['game/answer-bank.js','game/discovery.js','game/solo-rules.js','game/solo-match.js','solo-challenge.js'];
 const positions=dependencies.map(name=>html.indexOf('src="./'+name));
 assert.ok(positions.every(pos=>pos>=0));
 assert.deepEqual(positions,positions.slice().sort((a,b)=>a-b));
});
test('all required solo controls exist once',()=>{
 for(const id of ['start','again','restart','winner','finalTotal','cumulative','results','matchEnd','submit','fields','botProgress','hudMyProgress','timer']){
 const token='id="'+id+'"';
 assert.ok(html.includes(token),'missing '+id);
 assert.equal(html.split(token).length-1,1,'duplicate '+id);
 }
});
test('controller uses five-round state machine',()=>{
 for(const token of ['flow.begin(match)','flow.commit(match','flow.finish(match)','flow.winner(match)','flow.leave(match)'])assert.ok(controller.includes(token),token);
});
