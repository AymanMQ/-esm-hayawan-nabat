const test=require('node:test');const assert=require('node:assert/strict');
const bank=require('../game/answer-bank.js');
const engine=require('../game/letters-engine.js');
test('accepted colour',()=>assert.equal(bank.classify('أحمر','لون','أ').status,'accepted'));
test('colour must not be accepted as animal',()=>assert.notEqual(bank.classify('أحمر','حيوان','أ').status,'accepted'));
test('food example valid only for category',()=>{assert.equal(bank.classify('أرز','أكلة','أ').status,'accepted');assert.notEqual(bank.classify('أرز','حيوان','أ').status,'accepted')});
test('unknown answer needs review',()=>assert.equal(bank.classify('أفلوف','أكلة','أ').status,'review'));
test('missing correct first letter is invalid',()=>assert.equal(bank.classify('أحمر','لون','م').status,'invalid'));
test('trusted scorer does not award for wrong category',()=>{
 const submitted={a:{حيوان:'أحمر',لون:'أحمر'},b:{حيوان:'أرنب',لون:'أحمر'}};
 const check=(word,cat,letter)=>bank.classify(word,cat,letter).status==='accepted';
 const r=engine.scoreRound(submitted,{},'أ',['حيوان','لون'],check);
 assert.deepEqual(r.scores,{a:5,b:15});
});
test('group vote may approve a disputed answer without globally training dictionary',()=>{
 const check=(word,cat,letter)=>bank.classify(word,cat,letter).status==='accepted';
 const r=engine.scoreRound({a:{أكلة:'أفلوف'}},{a:{أكلة:true}},'أ',['أكلة'],check);
 assert.equal(r.scores.a,10);
 assert.equal(bank.classify('أفلوف','أكلة','أ').status,'review');
});
