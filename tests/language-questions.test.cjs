const test=require('node:test'),assert=require('node:assert/strict'),q=require('../game/language-questions.js');
test('all sample questions have valid options',()=>assert.equal(q.validate(),true));
test('beginner has five questions per track',()=>{assert.equal(q.select('general',1).length,5);assert.equal(q.select('verbal',1).length,5)});
test('mixed track includes both areas',()=>{const all=q.select('mixed',3,20,()=>.5);assert.equal(new Set(all.map(x=>x.track)).size,2)});
test('level filter excludes advanced',()=>assert.ok(q.select('general',1,30).every(x=>x.level===1)));
test('no duplicated question ids',()=>assert.equal(new Set(q.questions.map(x=>x.id)).size,q.questions.length));

test('literary tracks include playable material',()=>{for(const track of ['proverbs','poetry','riddles'])assert.ok(q.select(track,3).length>=3)});
test('mixed session includes poetry, proverbs and riddles',()=>{const tracks=new Set(q.select('mixed',3).map(x=>x.track));for(const t of ['proverbs','poetry','riddles'])assert.ok(tracks.has(t))});
test('literary items label their provenance',()=>assert.ok(q.questions.filter(x=>['proverbs','poetry','riddles'].includes(x.track)).every(x=>x.sourceTitle)));
