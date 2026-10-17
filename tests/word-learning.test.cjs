const test=require('node:test'),assert=require('node:assert/strict'),learning=require('../game/word-learning.js'),discovery=require('../game/discovery.js');
test('curated learning notes have full explanations',()=>assert.equal(learning.validate(),true));
test('a known word matches its spelling variants',()=>assert.equal(learning.noteFor('نبات','ريحان').meaning,learning.noteFor('نبات','رِيحَان').meaning));
test('unknown word is not given a made-up definition',()=>assert.equal(learning.noteFor('نبات','كلمة غير معروفة'),null));
test('questions only use discovered and curated words',()=>{const h=discovery.clean();discovery.record(h,'نبات','ريحان',true);discovery.record(h,'نبات','موز',true);const q=learning.questionsFor(h);assert.equal(q.length,1);assert.match(q[0].q,/ريحان/)});
