'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const bank=require('../game/answer-bank.js'),discovery=require('../game/discovery.js');
const script=fs.readFileSync(path.join(__dirname,'../solo-challenge.js'),'utf8');
const ids=['difficulty','difficultyName','timeLimit','start','intro','play','results','matchEnd','fields','submit','round','letter','hudLetter','myCount','hudMyCount','hudMyProgress','liveScore','botStatus','botCount','botProgress','finishWarning','timer','answers','resultLetter','score','cumulative','outcome','again','home','restart','matchHome','finalTotal','winner','matchDiscovery','discoveryCount','hudCurrentField'];
function fixture(){
 let now=0,next=1;const timeouts=new Map(),intervals=new Map(),elements=new Map();
 const create=(tag='div')=>{const el={tagName:tag.toUpperCase(),children:[],listeners:{},classList:{items:new Set(),add(v){this.items.add(v)},remove(v){this.items.delete(v)},toggle(v,force){if(force===undefined)force=!this.items.has(v);if(force)this.items.add(v);else this.items.delete(v);return force},contains(v){return this.items.has(v)}},style:{},value:'',textContent:'',disabled:false,attributes:{},parentElement:null,
 addEventListener(name,fn){this.listeners[name]=fn},append(...children){for(const child of children){child.parentElement=this;this.children.push(child);if(child.id)elements.set(child.id,child)}},replaceChildren(...children){this.children=[];this.append(...children)},querySelector(){return null},querySelectorAll(selector){return selector==='input'?this.children.filter(x=>x.tagName==='INPUT'):[]},focus(){document.activeElement=this;this.listeners.focus?.()},blur(){if(document.activeElement===this)document.activeElement=null},setAttribute(name,value){this.attributes[name]=value}};
 return el};
 for(const id of ids){const el=create();el.id=id;elements.set(id,el)}
 elements.get('difficulty').value='1';elements.get('timer').parentElement=create();
 const document={activeElement:null,visibilityState:'visible',listeners:{},addEventListener(name,fn){this.listeners[name]=fn},getElementById:id=>elements.get(id)||null,createElement:create};
 const local=new Map();
 const localStorage={getItem:k=>local.has(k)?local.get(k):null,setItem:(k,v)=>local.set(k,String(v))};
 const clock={now:()=>now};
 const context={window:{AnswerBank:bank,WordDiscovery:discovery,scrollTo(){}},document,localStorage,Date:class extends Date{static now(){return now}},Math,console,setTimeout(fn){const id=next++;timeouts.set(id,fn);return id},clearTimeout:id=>timeouts.delete(id),setInterval(fn){const id=next++;intervals.set(id,fn);return id},clearInterval:id=>intervals.delete(id)};
 vm.runInNewContext(script,context);
 const click=id=>{const el=elements.get(id);assert.ok(el?.listeners.click,'missing click '+id);el.listeners.click()};
 const drain=()=>{for(let i=0;i<50&&timeouts.size;i++){const tasks=[...timeouts.entries()];timeouts.clear();for(const [,fn] of tasks)fn()}assert.equal(timeouts.size,0)};
 const tick=()=>{for(const fn of [...intervals.values()])fn()};
 return {elements,click,drain,tick,advance(ms){now+=ms},get:id=>elements.get(id),document,timeouts,intervals};
}
test('five rounds progress to winner with no lost answers',()=>{
 const f=fixture();f.click('start');
 for(let round=1;round<=5;round++){
  assert.match(f.get('round').textContent,new RegExp('^'+round+' / 5'));
  assert.equal(f.get('fields').children.filter(x=>x.tagName==='INPUT').length,5);
  const letter=f.get('hudLetter').textContent;
  const matching=bank.words['اسم'].find(w=>bank.normalize(w).startsWith(bank.normalize(letter)));
  if(matching){f.get('f0').value=matching;f.get('f0').listeners.input();assert.equal(f.get('hudMyCount').textContent,'1 من 5')}
  f.click('submit');f.drain();
  assert.equal(f.get('again').disabled,false);
  f.click('again');
 }
 assert.match(f.get('winner').textContent,/المباراة/);
 assert.equal(f.get('matchEnd').classList.contains('hidden'),false);
 assert.equal(f.intervals.size,0);
});
test('time expiry submits exactly once and disables answers',()=>{
 const f=fixture();f.click('start');f.advance(130000);f.tick();
 assert.equal(f.get('results').classList.contains('hidden'),false);
 assert.equal(f.get('submit').disabled,true);
 assert.equal(f.get('f0').disabled,true);
 const previous=f.get('score').textContent;f.click('submit');assert.equal(f.get('score').textContent,previous);
 f.drain();
});
test('leaving results cancels delayed answer reveals',()=>{
 const f=fixture();f.click('start');f.click('submit');assert.ok(f.timeouts.size>0);
 f.click('home');assert.equal(f.timeouts.size,0);
 assert.equal(f.get('intro').classList.contains('hidden'),false);
 assert.equal(f.intervals.size,0);
});
test('Enter moves to next field without submitting round',()=>{
 const f=fixture();f.click('start');f.get('f0').listeners.keydown({key:'Enter',preventDefault(){}});
 assert.equal(f.get('hudCurrentField').textContent,'تكتب الآن: حيوان ✏️');
 assert.equal(f.get('play').classList.contains('hidden'),false);
});

test('answers entered after the deadline are never scored',()=>{
 const f=fixture();f.click('start');f.advance(130000);
 f.get('f0').value='محمد';f.get('f0').listeners.input();
 assert.equal(f.get('f0').value,'');
 assert.equal(f.get('results').classList.contains('hidden'),false);
 assert.match(f.get('score').textContent,/أنت 0/);
 f.drain();
});
test('bank does not award a country as an animal',()=>{
 assert.notEqual(bank.classify('كويت','حيوان','ك').status,'accepted');
 assert.equal(bank.classify('كويت','بلاد','ك').status,'accepted');
});
test('all five input fields have keyboard hints',()=>{
 const f=fixture();f.click('start');
 for(let i=0;i<4;i++)assert.equal(f.get('f'+i).enterKeyHint,'next');
 assert.equal(f.get('f4').enterKeyHint,'done');
});

test('returning from background immediately reconciles an expired timer',()=>{
 const f=fixture();f.click('start');f.document.visibilityState='hidden';f.advance(130000);
 f.document.visibilityState='visible';f.document.listeners.visibilitychange();
 assert.equal(f.get('results').classList.contains('hidden'),false);
 assert.equal(f.intervals.size,0);
 f.drain();
});
