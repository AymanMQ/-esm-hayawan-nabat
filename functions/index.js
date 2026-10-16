'use strict';
// Server-only game actions. Do not deploy before migrating RTDB rules and UI.
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getDatabase}=require('firebase-admin/database');
const {initializeApp}=require('firebase-admin/app');
const {scoreRound,CATEGORIES,voteDecision}=require('./lib/letters-engine');
initializeApp();
const db=getDatabase();
const uidOf=r=>{if(!r.auth?.uid)throw new HttpsError('unauthenticated','سجل الدخول أولًا');return r.auth.uid};
const codeOf=s=>{if(typeof s!=='string'||!/^[A-Z2-9]{6}$/.test(s))throw new HttpsError('invalid-argument','كود غير صالح');return s};
const roundOf=n=>{if(!Number.isInteger(n)||n<1||n>50)throw new HttpsError('invalid-argument','رقم جولة غير صالح');return n};
const categoryOf=c=>{if(!CATEGORIES.includes(c))throw new HttpsError('invalid-argument','فئة غير صالحة');return c};
const reviewPath=(room,round)=>'reviews/'+room+'/'+round;
async function stateFor(room,round,uid){const s=(await db.ref('rooms/'+room).get()).val();if(!s||s.round!==round||!s.players?.[uid])throw new HttpsError('failed-precondition','لا تملك صلاحية هذه الجولة');return s}
exports.submitAnswers=onCall({maxInstances:20},async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.phase!=='playing'||Date.now()>s.endsAt)throw new HttpsError('failed-precondition','انتهى وقت التسليم');
 const answers={};for(const c of CATEGORIES){const v=request.data?.answers?.[c];if(typeof v!=='string'||v.length>60)throw new HttpsError('invalid-argument','إجابة غير صالحة');answers[c]=v.trim()}
 const tx=await db.ref('submissions/'+room+'/'+round+'/'+uid).transaction(v=>v===null?{answers,submittedAt:Date.now()}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','تم التسليم مسبقًا');
 return {ok:true};
});
exports.openReview=onCall({maxInstances:10},async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.host!==uid||s.phase!=='playing'||Date.now()<s.endsAt)throw new HttpsError('failed-precondition','المراجعة غير متاحة');
 const submissions=(await db.ref('submissions/'+room+'/'+round).get()).val()||{};
 const answers={};for(const id of Object.keys(s.players)){answers[id]=submissions[id]?.answers||Object.fromEntries(CATEGORIES.map(c=>[c,'']))}
 const openedAt=Date.now(),ref=db.ref(reviewPath(room,round));
 const tx=await ref.transaction(v=>v===null?{answers,openedAt,closesAt:openedAt+45000,status:'review',challenges:{}}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','المراجعة مفتوحة بالفعل');
 await db.ref('rooms/'+room+'/phase').transaction(v=>v==='playing'?'review':undefined);
 return {ok:true,closesAt:openedAt+45000};
});
exports.challengeAnswer=onCall({maxInstances:20},async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),author=request.data?.author,category=categoryOf(request.data?.category);
 const s=await stateFor(room,round,uid);
 if(s.phase!=='review'||!s.players?.[author]||author===uid)throw new HttpsError('failed-precondition','الاعتراض غير متاح');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!review||review.status!=='review'||Date.now()>=review.closesAt||!review.answers?.[author]?.[category])throw new HttpsError('failed-precondition','انتهت المراجعة أو الإجابة فارغة');
 const tx=await ref.child('challenges/'+author+'/'+category).transaction(v=>v===null?{openedBy:uid,openedAt:Date.now(),votes:{}}:undefined);
 return {ok:true,created:tx.committed};
});
exports.voteAnswer=onCall({maxInstances:30},async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),author=request.data?.author,category=categoryOf(request.data?.category),accept=request.data?.accept;
 if(typeof accept!=='boolean')throw new HttpsError('invalid-argument','صوت غير صالح');
 const s=await stateFor(room,round,uid);
 if(s.phase!=='review'||!s.players?.[author]||author===uid)throw new HttpsError('failed-precondition','لا يمكنك التصويت');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!review||review.status!=='review'||Date.now()>=review.closesAt||!review.challenges?.[author]?.[category])throw new HttpsError('failed-precondition','التصويت غير متاح');
 const tx=await ref.child('challenges/'+author+'/'+category+'/votes/'+uid).transaction(v=>v===null?accept:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','سبق أن صوتّت');
 return {ok:true};
});
exports.finalizeReview=onCall({maxInstances:10},async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.host!==uid||s.phase!=='review')throw new HttpsError('failed-precondition','فقط المضيف يمكنه إنهاء المراجعة');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!review||Date.now()<review.closesAt)throw new HttpsError('failed-precondition','التصويت لم ينتهِ');
 // Close review atomically, preventing additional votes.
 const close=await ref.child('status').transaction(v=>v==='review'?'closed':undefined);
 if(!close.committed)throw new HttpsError('already-exists','المراجعة أُغلقت');
 const closed=(await ref.get()).val(),ids=Object.keys(s.players),decisions={};
 for(const [author,byCategory] of Object.entries(closed.challenges||{})){
   for(const [category,challenge] of Object.entries(byCategory||{})){
     if(!CATEGORIES.includes(category)||!ids.includes(author))continue;
     (decisions[author]??={})[category]=voteDecision(challenge.votes||{},author,ids).accepted;
   }
 }
 const {scores,details}=scoreRound(closed.answers||{},decisions,s.letter);
 // Idempotent room totals transaction; cannot award points twice for the same round.
 const roomRef=db.ref('rooms/'+room);
 const tx=await roomRef.transaction(v=>{
   if(!v||v.round!==round||v.phase!=='review'||v.lastScoredRound===round)return;
   const totals={...(v.totals||{})};
   for(const id of ids)totals[id]=(totals[id]||0)+(scores[id]||0);
   return {...v,phase:'results',lastScoredRound:round,totals,roundScores:scores};
 });
 if(!tx.committed)throw new HttpsError('aborted','تعذر اعتماد النتائج؛ تحقق من حالة الروم');
 await ref.child('results').set({scores,details,decisions,finalizedAt:Date.now()});
 return {ok:true,scores};
});
