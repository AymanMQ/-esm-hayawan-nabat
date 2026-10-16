const test=require('node:test'),assert=require('node:assert/strict');
const planner=require('../game/tournament-bracket'),p=require('../game/tournament-progression');
test('two matches advance into final after verified scores',()=>{
 let s=p.startBracket(planner.planTournament(['a','b','c','d'],2),'event');
 assert.equal(p.completeRound(s,'event').status,'waiting');
 assert.throws(()=>p.recordVerifiedMatch(s,s.matches[0].id,{a:10,b:5},{}),/Verified/);
 s=p.recordVerifiedMatch(s,s.matches[0].id,{a:10,b:5},{trustedServer:true,sourceId:'room1'});
 s=p.recordVerifiedMatch(s,s.matches[1].id,{c:2,d:8},{trustedServer:true,sourceId:'room2'});
 const next=p.completeRound(s,'event');
 assert.equal(next.status,'next_round');assert.deepEqual(next.state.matches[0].players,['a','d']);
 s=p.recordVerifiedMatch(next.state,next.state.matches[0].id,{a:12,d:15},{trustedServer:true,sourceId:'room3'});
 assert.equal(p.completeRound(s,'event').state.champion,'d');
});
test('same verified event id cannot award a second result',()=>{
 const s=p.startBracket(planner.planTournament(['a','b'],2),'e');
 const v={trustedServer:true,sourceId:'source'};
 const a=p.recordVerifiedMatch(s,s.matches[0].id,{a:5,b:10},v);
 assert.equal(p.recordVerifiedMatch(a,s.matches[0].id,{a:5,b:10},v),a);
 assert.throws(()=>p.recordVerifiedMatch(a,s.matches[0].id,{a:10,b:0},{trustedServer:true,sourceId:'forged'}),/already/);
});
test('ties block advancement and require distinct resolution',()=>{
 const s=p.startBracket(planner.planTournament(['a','b','c'],3),'event');
 const next=p.recordVerifiedMatch(s,s.matches[0].id,{a:5,b:5,c:2},{trustedServer:true,sourceId:'room'});
 assert.equal(p.completeRound(next,'event').status,'tiebreak');
});
test('cannot inject or omit participants',()=>{
 const s=p.startBracket(planner.planTournament(['a','b'],2),'event');
 assert.throws(()=>p.recordVerifiedMatch(s,s.matches[0].id,{a:10,c:5},{trustedServer:true,sourceId:'x'}),/Invalid score/);
});
