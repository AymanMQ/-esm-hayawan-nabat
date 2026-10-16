'use strict';
/* Tournament enrollment foundation; server clock and Firebase Auth are authoritative. */
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getDatabase}=require('firebase-admin/database');
const {initializeApp,getApps}=require('firebase-admin/app');
const {upcoming,eventId}=require('./lib/tournament-schedule');
const {planTournament}=require('./lib/tournament-bracket');
if(!getApps().length)initializeApp();
const db=getDatabase(),options={region:'asia-southeast1',maxInstances:10};
const requireUser=r=>{if(!r.auth?.uid)throw new HttpsError('unauthenticated','الدخول مطلوب');return r.auth.uid};
function eventArgs(data,now){
 const startsAt=data?.startsAt,groupSize=data?.groupSize;
 if(![2,3,5].includes(groupSize)||!Number.isSafeInteger(startsAt))throw new HttpsError('invalid-argument','نوع البطولة أو موعدها غير صحيح');
 if(startsAt%3600000!==0||startsAt<now-2*3600000||startsAt>now+24*3600000)throw new HttpsError('failed-precondition','التسجيل خارج المواعيد القادمة');
 return {id:eventId(startsAt,groupSize),startsAt,groupSize,closesAt:startsAt-60000};
}
exports.registerTournament=onCall(options,async request=>{
 const uid=requireUser(request),now=Date.now(),args=eventArgs(request.data,now);
 if(now>=args.closesAt||now<args.startsAt-3600000)throw new HttpsError('failed-precondition','التسجيل غير مفتوح الآن');
 const nickname=String(request.data?.nickname||'').trim();
 if(nickname.length<2||nickname.length>25)throw new HttpsError('invalid-argument','اسم لاعب غير صالح');
 const ref=db.ref('tournaments/'+args.id);
 const tx=await ref.transaction(t=>{
   const initial={id:args.id,startsAt:args.startsAt,closesAt:args.closesAt,groupSize:args.groupSize,status:'registration',players:{}};
   t=t||initial;
   if(t.startsAt!==args.startsAt||t.groupSize!==args.groupSize||t.status!=='registration'||Object.keys(t.players||{}).length>=125&&!t.players?.[uid])return;
   if(t.players?.[uid])return t;
   return {...t,players:{...t.players,[uid]:{name:nickname,registeredAt:now}}};
 });
 if(!tx.committed)throw new HttpsError('resource-exhausted','التسجيل مغلق أو ممتلئ');
 return {ok:true,eventId:args.id,count:Object.keys(tx.snapshot.val().players||{}).length};
});
exports.tournamentStatus=onCall(options,async request=>{
 const uid=requireUser(request),now=Date.now(),args=eventArgs(request.data,now);
 const ev=(await db.ref('tournaments/'+args.id).get()).val();
 return {eventId:args.id,startsAt:args.startsAt,groupSize:args.groupSize,status:ev?.status||'not_opened',registered:Object.keys(ev?.players||{}).length,isRegistered:!!ev?.players?.[uid],bracket:ev?.bracket||null};
});
/* Lazy finalization invoked by an authenticated player. Not a scheduler; future Cloud Scheduler needed. */
exports.lockTournamentRegistration=onCall(options,async request=>{
 const uid=requireUser(request),now=Date.now(),args=eventArgs(request.data,now);
 if(now<args.closesAt)throw new HttpsError('failed-precondition','لم يُغلق التسجيل بعد');
 const ref=db.ref('tournaments/'+args.id);
 const tx=await ref.transaction(t=>{
   if(!t||t.status!=='registration'||!t.players?.[uid])return;
   // Registered players are sorted deterministically; shuffle/seeding must be added before ranked launch.
   const participants=Object.keys(t.players).sort();
   const plan=planTournament(participants,args.groupSize);
   return {...t,status:plan.status==='ready'?'bracket_prepared':'insufficient',bracket:plan,lockedAt:now};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','لا يمكن تجهيز البطولة');
 return {status:tx.snapshot.val().status,bracket:tx.snapshot.val().bracket};
});
