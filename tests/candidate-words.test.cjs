const test=require('node:test'),assert=require('node:assert/strict');
const c=require('../game/candidate-words.js'),bank=require('../game/answer-bank.js');
test('normalization handles Arabic hamza',()=>assert.equal(c.normalize('  أَسَد  '),'اسد'));
test('same word and category has stable candidate ID',()=>assert.equal(c.keyFor('اسم','أحمد'),c.keyFor('اسم','احمد')));
test('category separated and encoded safely',()=>{assert.notEqual(c.keyFor('اسم','أحمر'),c.keyFor('لون','أحمر'));assert.doesNotMatch(c.keyFor('بلاد','كويت'),/[.#$\[\]\/]/)});
test('collect unknown entries only, no automatic approval',()=>{const list=c.candidatesFromReview({p1:{حيوان:'أفلوف',بلاد:'كويت'},p2:{حيوان:'أسد'}},{p1:{حيوان:true}},'أ',bank.classify,['حيوان','بلاد']);assert.equal(list.length,1);assert.equal(list[0].status,'pending');assert.equal(list[0].accepted,true)});
test('do not record wrong first letter',()=>assert.deepEqual(c.candidatesFromReview({p:{حيوان:'كويت'}},{},'أ',bank.classify,['حيوان']),[]));
