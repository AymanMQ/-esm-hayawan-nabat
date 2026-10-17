const test=require('node:test'),assert=require('node:assert/strict');
const flow=require('../game/solo-match.js');
test('five rounds transition in order and scores accumulate once',()=>{
 const s=flow.create();
 for(let n=1;n<=5;n++){
   assert.equal(flow.begin(s),true);assert.equal(s.round,n);
   assert.equal(flow.begin(s),false);
   assert.equal(flow.commit(s,{mine:10*n,theirs:5,discoveries:1}),true);
   assert.equal(flow.commit(s,{mine:10*n,theirs:5,discoveries:1}),false);
   assert.deepEqual(s.totals,[10*n*(n+1)/2,5*n]);
   if(n<5)assert.equal(flow.finish(s),false);
 }
 assert.equal(flow.begin(s),false);
 assert.equal(flow.finish(s),true);
 assert.equal(flow.finish(s),false);
 assert.equal(flow.winner(s),'player');
 assert.deepEqual(s.totals,[150,25]);
 assert.equal(s.discoveries,5);
});
test('tie and opponent wins are identified correctly',()=>{
 for(const [a,b,result] of [[5,5,'tie'],[2,10,'opponent']]){
 const s=flow.create();for(let i=0;i<5;i++){flow.begin(s);flow.commit(s,{mine:a,theirs:b})}
 flow.finish(s);assert.equal(flow.winner(s),result);
 }
});
test('cannot finish incomplete match or score after leaving',()=>{
 const s=flow.create();flow.begin(s);flow.commit(s,{mine:10,theirs:0});assert.equal(flow.finish(s),false);
 flow.leave(s);assert.equal(flow.begin(s),false);assert.equal(flow.commit(s,{mine:10,theirs:0}),false);
});
test('invalid or negative score cannot be accepted',()=>{
 const s=flow.create();flow.begin(s);
 assert.throws(()=>flow.commit(s,{mine:-5,theirs:0}),/Invalid points/);
 assert.equal(s.phase,'playing');assert.deepEqual(s.totals,[0,0]);
});
