const test=require('node:test'),assert=require('node:assert/strict'),q=require('../game/language-questions.js');
test('all sample questions have valid options',()=>assert.equal(q.validate(),true));
test('beginner has five questions per track',()=>{assert.equal(q.select('general',1).length,5);assert.equal(q.select('verbal',1).length,5)});
test('mixed track includes both areas',()=>{const all=q.select('mixed',3,20,()=>.5);assert.ok(new Set(all.map(x=>x.track)).has('general'));assert.ok(new Set(all.map(x=>x.track)).has('verbal'))});
test('level filter excludes advanced',()=>assert.ok(q.select('general',1,30).every(x=>x.level===1)));
test('no duplicated question ids',()=>assert.equal(new Set(q.questions.map(x=>x.id)).size,q.questions.length));

test('literary tracks include playable material',()=>{for(const track of ['proverbs','poetry','riddles'])assert.ok(q.select(track,3).length>=3)});
test('mixed session includes poetry, proverbs and riddles',()=>{const tracks=new Set(q.select('mixed',3).map(x=>x.track));for(const t of ['proverbs','poetry','riddles'])assert.ok(tracks.has(t))});
test('literary items label their provenance',()=>assert.ok(q.questions.filter(x=>['proverbs','poetry','riddles'].includes(x.track)).every(x=>x.sourceTitle)));

test('Diwaniya has five playable prompts for beginners',()=>assert.equal(q.select('diwaniya',1).length,5));
test('Diwaniya advanced prompts carry attribution or original label',()=>assert.ok(q.select('diwaniya',3,20).every(x=>x.sourceTitle)));

test('Diwaniya has five beginner questions',()=>assert.equal(q.select('diwaniya',1).length,5));
test('Diwaniya entries have clear provenance',()=>assert.ok(q.questions.filter(x=>x.track==='diwaniya').every(x=>x.sourceTitle)));
test('all answer choices are unique',()=>assert.ok(q.questions.every(x=>new Set(x.choices).size===4)));

test('Diwaniya has twenty diverse prompts',()=>{const items=q.questions.filter(x=>x.track==='diwaniya');assert.ok(items.length>=20);for(const kind of ['من القائل؟','أكمل البيت','لغز شعري','حرف الروي'])assert.ok(items.some(x=>x.kind===kind))});
test('poetry questions have attribution, original riddles marked original',()=>{const items=q.questions.filter(x=>x.track==='diwaniya');assert.ok(items.every(x=>x.sourceTitle));assert.ok(items.filter(x=>x.kind==='لغز شعري').every(x=>x.sourceTitle.includes('أصلي')))});
