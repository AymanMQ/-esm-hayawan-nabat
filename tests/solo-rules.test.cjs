const test=require('node:test'),assert=require('node:assert/strict');
const rules=require('../game/solo-rules.js'),bank=require('../game/answer-bank.js'),discovery=require('../game/discovery.js');
const categories=['اسم','حيوان','نبات','جماد','بلاد'];
function round(answers={},computer={},letter='أ',history=discovery.clean()){return rules.scoreRound({categories,answers,computer,letter,bank,discovery,history})}
test('valid answer earns 10 and new-word bonus 5 once',()=>{
 const h=discovery.clean(),a={اسم:'أحمد'};
 const first=round(a,{},'أ',h),second=round(a,{},'أ',h);
 assert.equal(first.mine,15);assert.equal(first.discoveries,1);
 assert.equal(second.mine,10);assert.equal(second.discoveries,0);
});
test('same valid answer as bot earns five base points for each plus first-time bonus',()=>{
 const x=round({حيوان:'أرنب'},{حيوان:'أرنب'});
 assert.equal(x.mine,10);assert.equal(x.theirs,5);
});
test('wrong-category word and wrong initial never earn points or discoveries',()=>{
 const x=round({حيوان:'كويت',بلاد:'مصر',نبات:'أحمد'});
 assert.equal(x.mine,0);assert.equal(x.discoveries,0);
 assert.equal(x.rows.find(v=>v.cat==='حيوان').a.status,'invalid');
});
test('unknown answer stays under review without automatic credit',()=>{
 const x=round({نبات:'أغصان'});
 assert.equal(x.mine,0);assert.equal(x.rows.find(v=>v.cat==='نبات').a.status,'review');
});
test('bot only scores completed valid words',()=>{
 const x=round({},{اسم:'أحمد',حيوان:'أرنب'});
 assert.equal(x.mine,0);assert.equal(x.theirs,20);
});
test('each category scored separately',()=>{
 const x=round({اسم:'أحمد',حيوان:'أرنب',نبات:'أناناس',جماد:'إبرة',بلاد:'ألمانيا'});
 assert.equal(x.mine,75);assert.equal(x.discoveries,5);
});
test('countdown ends at zero and never becomes negative',()=>{
 assert.equal(rules.remainingSeconds(10000,10000),0);
 assert.equal(rules.remainingSeconds(10000,9999),1);
 assert.equal(rules.remainingSeconds(10000,12000),0);
});
test('bot completion can shorten but never extend a deadline',()=>{
 assert.equal(rules.nextDeadline(100000,30000,true),40000);
 assert.equal(rules.nextDeadline(35000,30000,true),35000);
 assert.equal(rules.nextDeadline(100000,30000,false),100000);
});
test('bot progress counts scheduled completions',()=>{
 const schedule=[{at:1000},{at:2000},{at:3000}];
 assert.equal(rules.completedCount(schedule,1500),1);
 assert.equal(rules.completedCount(schedule,3000),3);
});

test('five rounds accumulate and do not award repeated discovery twice',()=>{
 const h=discovery.clean();let total=0,discoveries=0;
 for(let i=0;i<5;i++){
   const result=round({اسم:'أحمد',حيوان:'أرنب'},{},'أ',h);
   total+=result.mine;discoveries+=result.discoveries;
 }
 assert.equal(total,110);
 assert.equal(discoveries,2);
});
test('all empty submissions score zero against an empty opponent',()=>{
 const result=round({},{});
 assert.equal(result.mine,0);assert.equal(result.theirs,0);
 assert.equal(result.discoveries,0);
});
test('normalization avoids extra discovery from spelling variants',()=>{
 const h=discovery.clean();
 assert.equal(round({اسم:'أحمد'},{},'أ',h).mine,15);
 assert.equal(round({اسم:'احمد'},{},'أ',h).mine,10);
});
