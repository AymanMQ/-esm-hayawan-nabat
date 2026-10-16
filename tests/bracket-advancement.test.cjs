const test=require('node:test'),assert=require('node:assert/strict');
const b=require('../game/tournament-bracket.js');
test('2-player bracket advances winners to next match',()=>{
 const matches=[{matchNumber:1,players:['a','b']},{matchNumber:2,players:['c','d']}];
 const result=b.advanceRound(matches,{1:{a:15,b:10},2:{c:5,d:20}},2);
 assert.equal(result.status,'next_round');assert.deepEqual(result.winners,['a','d']);
 assert.deepEqual(result.nextMatches,[{matchNumber:1,players:['a','d']}]);
});
test('3-player final yields champion',()=>{
 const result=b.advanceRound([{matchNumber:1,players:['a','b','c']}],{1:{a:10,b:30,c:20}},3);
 assert.equal(result.status,'champion');assert.equal(result.champion,'b');
});
test('5-player tie requires tiebreak before advancing',()=>{
 const ids=['a','b','c','d','e'];
 const result=b.advanceRound([{matchNumber:1,players:ids}],{1:{a:20,b:20,c:0,d:5,e:10}},5);
 assert.equal(result.status,'tiebreak');assert.deepEqual(result.tiebreaks[0].players,['a','b']);
});
test('cannot use unverified or missing scores',()=>{
 assert.throws(()=>b.advanceRound([{matchNumber:1,players:['a','b']}],{},2),/verified/);
 assert.throws(()=>b.advanceRound([{matchNumber:1,players:['a','b']}],{1:{a:10}},2),/Unverified/);
});
