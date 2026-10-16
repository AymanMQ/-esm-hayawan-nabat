const test=require('node:test'),assert=require('node:assert/strict');
const engine=require('../game/letters-engine.js');
const categoryRules=require('../game/categories.js');
test('custom colour and food categories score from chosen snapshot',()=>{
 const categories=categoryRules.validate([...categoryRules.DEFAULT,'لون','أكلة']);
 const submissions={a:{لون:'أحمر',أكلة:'أرز'},b:{لون:'أزرق',أكلة:'أرز'}};
 const result=engine.scoreRound(submissions,{},'أ',categories);
 assert.deepEqual(result.scores,{a:15,b:15});
 assert.equal(result.details.a['أكلة'],5);
 assert.equal(result.details.a['لون'],10);
});
test('unused default categories do not create phantom points',()=>{
 const r=engine.scoreRound({a:{اسم:'أحمد',لون:'أحمر'}},{},'أ',['اسم','لون','أكلة']);
 assert.equal(r.scores.a,20);
 assert.deepEqual(Object.keys(r.details.a),['اسم','لون','أكلة']);
});
test('proposals cannot create invalid category lengths',()=>assert.throws(()=>categoryRules.propose('ش'.repeat(26)),/25/));
