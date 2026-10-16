'use strict';
// Trusted scoring foundation. Deployment is deliberately not enabled yet.
// Firebase Functions v2 HTTP callable endpoints; Firebase Auth required.
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getDatabase}=require('firebase-admin/database');
const {initializeApp}=require('firebase-admin/app');
initializeApp();
const {scoreRound,normalize,matchesLetter,CATEGORIES,voteDecision}=require('./lib/letters-engine');
const db=getDatabase();
const requireUser=request=>{if(!request.auth?.uid)throw new HttpsError('unauthenticated','سجل الدخول أولًا');return request.auth.uid;};
const safeCode=s=>{if(typeof s!=='string'||!/^[A-Z2-9]{6}$/.test(s))throw new HttpsError('invalid-argument','كود غير صالح');return s;};
const safeRound=n=>{if(!Number.isInteger(n)||n<1||n>50)throw new HttpsError('invalid-argument','رقم جولة غير صالح');return n;};
exports.submitAnswers=onCall({maxInstances:20},async request=>{
 const uid=requireUser(request),room=safeCode(request.data?.room),round=safeRound(request.data?.round);
 const state=(await db.ref('rooms/'+room).get()).val();
 if(!state||!state.players?.[uid]||state.phase!=='playing'||state.round!==round)throw new HttpsError('failed-precondition','الجولة غير متاحة');
 const now=Date.now();if(now>state.endsAt+1500)throw new HttpsError('deadline-exceeded','انتهى الوقت');
 const answers={};for(const c of CATEGORIES){const v=request.data?.answers?.[c];if(typeof v!=='string'||v.length>60)throw new HttpsError('invalid-argument','إجابة غير صالحة');answers[c]=v.trim();}
 const ref=db.ref('submissions/'+room+'/'+round+'/'+uid);
 const tx=await ref.transaction(current=>current===null?{answers,submittedAt:now}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','تم التسليم بالفعل');
 return {ok:true};
});
exports.finalizeRound=onCall({maxInstances:10},async request=>{
 const uid=requireUser(request),room=safeCode(request.data?.room),round=safeRound(request.data?.round);
 const roomRef=db.ref('rooms/'+room);const state=(await roomRef.get()).val();
 if(!state||state.host!==uid||state.round!==round||state.phase!=='playing')throw new HttpsError('failed-precondition','غير مسموح');
 if(Date.now()<state.endsAt)throw new HttpsError('failed-precondition','الجولة لم تنتهِ');
 // A provisional review snapshot, NOT final points: the server must first collect challenges/votes.
 const raw=(await db.ref('submissions/'+room+'/'+round).get()).val()||{};
 const review={};for(const playerId of Object.keys(state.players||{})){review[playerId]=raw[playerId]?.answers||Object.fromEntries(CATEGORIES.map(c=>[c,'']));}
 const reviewRef=db.ref('reviews/'+room+'/'+round);
 const tx=await reviewRef.transaction(v=>v===null?{answers:review,openedAt:Date.now(),status:'review'}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','المراجعة موجودة');
 await roomRef.child('phase').set('review');
 return {ok:true};
});
// Voting and final scoring must be implemented and audited before enabling production.
