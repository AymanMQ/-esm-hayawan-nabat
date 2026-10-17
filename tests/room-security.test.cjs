const test=require('node:test'),assert=require('node:assert/strict');
const build=require('../functions/rooms.js');
class HttpsError extends Error{constructor(code,message){super(message);this.code=code}}
function harness(){
 const data=new Map();
 const db={ref(path){return {async transaction(fn){const current=data.has(path)?data.get(path):null;const next=fn(current);if(next===undefined)return {committed:false,snapshot:{val:()=>current}};data.set(path,next);return {committed:true,snapshot:{val:()=>next}}}}}};
 const handlers=build({onCall:(_options,fn)=>fn,HttpsError,options:{},db,uidOf:r=>{if(!r.auth?.uid)throw new HttpsError('unauthenticated','Login required');return r.auth.uid},codeOf:s=>{if(typeof s!=='string'||!(/^[A-Z2-9]{6}$/).test(s))throw new HttpsError('invalid-argument','Invalid room');return s}});
 return {handlers,data};
}
test('only authenticated users can create rooms and become host',async()=>{
 const {handlers,data}=harness();
 await assert.rejects(handlers.createRoom({data:{name:'أحمد'}}),e=>e.code==='unauthenticated');
 const r=await handlers.createRoom({auth:{uid:'host'},data:{name:'أحمد'}});
 assert.match(r.room,/^[A-Z2-9]{6}$/);
 assert.equal(data.get('rooms/'+r.room).host,'host');
 assert.equal(data.get('rooms/'+r.room).players.host.name,'أحمد');
});
test('join requires room code and cannot add players after start',async()=>{
 const {handlers,data}=harness();
 const {room}=await handlers.createRoom({auth:{uid:'host'},data:{name:'أحمد'}});
 await handlers.joinRoom({auth:{uid:'guest'},data:{room,name:'سارة'}});
 assert.equal(data.get('rooms/'+room).players.guest.name,'سارة');
 data.get('rooms/'+room).phase='playing';
 await assert.rejects(handlers.joinRoom({auth:{uid:'another'},data:{room,name:'نورة'}}),e=>e.code==='failed-precondition');
});
test('invalid names and unknown rooms are rejected',async()=>{
 const {handlers}=harness();
 await assert.rejects(handlers.createRoom({auth:{uid:'host'},data:{name:'<x>'}}),e=>e.code==='invalid-argument');
 await assert.rejects(handlers.joinRoom({auth:{uid:'guest'},data:{room:'ABCDEF',name:'سارة'}}),e=>e.code==='failed-precondition');
});
test('per-user create throttling rejects immediate repeated requests',async()=>{
 const {handlers}=harness();
 await handlers.createRoom({auth:{uid:'host'},data:{name:'أحمد'}});
 await assert.rejects(handlers.createRoom({auth:{uid:'host'},data:{name:'أحمد'}}),e=>e.code==='resource-exhausted');
});
