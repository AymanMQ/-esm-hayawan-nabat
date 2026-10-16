const test=require('node:test');const assert=require('node:assert/strict');const c=require('../game/categories.js');
test('default categories are valid',()=>assert.deepEqual(c.validate(c.DEFAULT),c.DEFAULT));
test('custom preset allowed',()=>assert.equal(c.propose('  أكلة  '),'أكلة'));
test('players cannot duplicate a category',()=>assert.throws(()=>c.validate(['اسم','حيوان','اسم']),/تكرار/));
test('at least three and at most nine categories',()=>{assert.throws(()=>c.validate(['اسم','حيوان']),/3/);assert.throws(()=>c.validate(Array.from({length:10},(_,i)=>'فئة '+i)),/9/)});
test('sanitize category input',()=>assert.throws(()=>c.propose('<script>'),/صالح/));
