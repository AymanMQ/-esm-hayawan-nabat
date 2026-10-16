const test=require('node:test'),assert=require('node:assert/strict'),e=require('../game/letters-engine.js');
test('Arabic alef variants and tashkeel match',()=>{assert.equal(e.matchesLetter('إبراهيم','أ'),true);assert.equal(e.matchesLetter('محمّد','م'),true);assert.equal(e.matchesLetter('خالد','م'),false)});
test('duplicate names get five each',()=>{const r=e.scoreRound({a:{اسم:'محمد'},b:{اسم:'محمّد'}},{},'م');assert.deepEqual(r.scores,{a:5,b:5})});
test('unique gets ten, rejected gets zero',()=>{const r=e.scoreRound({a:{اسم:'محمد'},b:{اسم:'ماجد'}},{b:{اسم:false}},'م');assert.deepEqual(r.scores,{a:10,b:0})});
test('votes exclude author and ties accepted',()=>{const r=e.voteDecision({a:false,b:true,c:false},'a',['a','b','c']);assert.equal(r.accepted,true);assert.equal(r.yes,1);assert.equal(r.no,1)});
test('only first letter does not imply semantic correctness',()=>{assert.equal(e.matchesLetter('مغناطيس','م'),true)});
