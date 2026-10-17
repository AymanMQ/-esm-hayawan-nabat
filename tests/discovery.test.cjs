const test=require('node:test'),assert=require('node:assert/strict');const d=require('../game/discovery.js');
test('novel valid word gains discovery once',()=>{const h=d.clean();assert.equal(d.isNew(h,'حيوان','أرنب',true),true);assert.equal(d.record(h,'حيوان','أرنب',true),true);assert.equal(d.isNew(h,'حيوان','ارنب',true),false);assert.equal(d.count(h),1)});
test('wrong or unknown words never enter history',()=>{const h=d.clean();assert.equal(d.record(h,'حيوان','كويت',false),false);assert.equal(d.count(h),0)});
test('different categories are independent',()=>{const h=d.clean();d.record(h,'نبات','أرز',true);assert.equal(d.isNew(h,'أكلة','أرز',true),true)});
test('history survives serialization and normalization',()=>{const h=d.clean();d.record(h,'اسم','أحمد',true);const restored=d.clean(JSON.parse(JSON.stringify(h)));assert.equal(d.isNew(restored,'اسم','احمد',true),false)});
test('malformed history is safely reset',()=>{assert.equal(d.count(d.clean({entries:[]})),0);assert.equal(d.count(d.clean({version:1,entries:null})),0)});
