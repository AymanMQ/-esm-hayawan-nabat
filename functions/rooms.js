'use strict';
// Room creation/joining is server-owned; clients cannot read rooms before membership.
const {randomInt}=require('node:crypto');
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_PLAYERS=12;
function roomCode(){return Array.from({length:6},()=>ALPHABET[randomInt(ALPHABET.length)]).join('')}
function playerName(value,HttpsError){
 if(typeof value!=='string')throw new HttpsError('invalid-argument','اسم غير صالح');
 const name=value.trim();
 if(name.length<2||name.length>25||/[\u0000-\u001F\u007F<>]/u.test(name))throw new HttpsError('invalid-argument','الاسم يجب أن يكون بين ٢ و٢٥ حرفًا');
 return name;
}
module.exports=function({onCall,HttpsError,options,db,uidOf,codeOf}){
 const throttle=async(uid,action,interval)=>{
   const ref=db.ref('requestThrottle/'+action+'/'+uid),now=Date.now();
   const tx=await ref.transaction(last=>(typeof last==='number'&&now-last<interval)?undefined:now);
   if(!tx.committed)throw new HttpsError('resource-exhausted','طلبات كثيرة، حاول بعد قليل');
 };
 const createRoom=onCall(options,async request=>{
   const uid=uidOf(request),name=playerName(request.data?.name,HttpsError);
   await throttle(uid,'createRoom',5000);
   for(let attempt=0;attempt<12;attempt++){
     const code=roomCode(),ref=db.ref('rooms/'+code),now=Date.now();
     const tx=await ref.transaction(existing=>existing===null?{
       host:uid,phase:'waiting',round:0,createdAt:now,
       players:{[uid]:{name,joinedAt:now}}
     }:undefined);
     if(tx.committed)return {room:code};
   }
   throw new HttpsError('resource-exhausted','تعذر إنشاء روم، حاول لاحقًا');
 });
 const joinRoom=onCall(options,async request=>{
   const uid=uidOf(request),room=codeOf(request.data?.room),name=playerName(request.data?.name,HttpsError);
   await throttle(uid,'joinRoom',1200);
   const ref=db.ref('rooms/'+room),now=Date.now();
   const tx=await ref.transaction(s=>{
     if(!s||!s.players||typeof s.players!=='object')return;
     if(s.players[uid])return s; // already a member: allow rejoining without changing name
     if(s.phase!=='waiting'||Object.keys(s.players).length>=MAX_PLAYERS)return;
     if(typeof s.createdAt==='number'&&now-s.createdAt>24*60*60*1000)return;
     return {...s,players:{...s.players,[uid]:{name,joinedAt:now}}};
   });
   if(!tx.committed)throw new HttpsError('failed-precondition','الروم غير موجود أو ممتلئ أو بدأ اللعب');
   return {ok:true,room};
 });
 return {createRoom,joinRoom};
};
