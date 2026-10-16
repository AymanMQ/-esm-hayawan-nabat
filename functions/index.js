'use strict';
// Server-only game actions. Do not deploy before migrating RTDB rules and UI.
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getDatabase}=require('firebase-admin/database');
const {initializeApp}=require('firebase-admin/app');
const {scoreRound,CATEGORIES,voteDecision,LETTERS}=require('./lib/letters-engine');
const {DEFAULT,PRESETS,validate,propose}=require('./lib/categories');
const {classify}=require('./lib/answer-bank');
const {keyFor,candidatesFromReview}=require('./lib/candidate-words');
const activeCats=s=>validate(s?.roundCategories||s?.categories||DEFAULT);
initializeApp();
const db=getDatabase();
const options={region:'asia-southeast1',maxInstances:20};
const uidOf=r=>{if(!r.auth?.uid)throw new HttpsError('unauthenticated','سجل الدخول أولًا');return r.auth.uid};
const codeOf=s=>{if(typeof s!=='string'||!/^[A-Z2-9]{6}$/.test(s))throw new HttpsError('invalid-argument','كود غير صالح');return s};
const roundOf=n=>{if(!Number.isInteger(n)||n<1||n>50)throw new HttpsError('invalid-argument','رقم جولة غير صالح');return n};
const categoryOf=c=>{if(typeof c!=='string'||c.length>25)throw new HttpsError('invalid-argument','فئة غير صالحة');return c};
const reviewPath=(room,round)=>'reviews/'+room+'/'+round;
async function stateFor(room,round,uid){const s=(await db.ref('rooms/'+room).get()).val();if(!s||s.round!==round||!s.players?.[uid])throw new HttpsError('failed-precondition','لا تملك صلاحية هذه الجولة');return s}
exports.startRound=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),ref=db.ref('rooms/'+room);
 const tx=await ref.transaction(s=>{
   if(!s||s.host!==uid||!['waiting','results'].includes(s.phase)||(s.round||0)>=5)return;
   const used=Array.isArray(s.usedLetters)?s.usedLetters:[];
   const pool=LETTERS.filter(letter=>!used.includes(letter));
   if(!pool.length)return;
   const letter=pool[Math.floor(Math.random()*pool.length)];
   return {...s,phase:'playing',round:(s.round||0)+1,letter,roundCategories:activeCats(s),endsAt:Date.now()+90000,usedLetters:[...used,letter]};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','لا يمكن بدء الجولة');
 return {ok:true,round:tx.snapshot.val().round};
});
exports.submitAnswers=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.phase!=='playing'||Date.now()>s.endsAt)throw new HttpsError('failed-precondition','انتهى وقت التسليم');
 const answers={};for(const c of activeCats(s)){const v=request.data?.answers?.[c];if(typeof v!=='string'||v.length>60)throw new HttpsError('invalid-argument','إجابة غير صالحة');answers[c]=v.trim()}
 const tx=await db.ref('submissions/'+room+'/'+round+'/'+uid).transaction(v=>v===null?{answers,submittedAt:Date.now()}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','تم التسليم مسبقًا');
 return {ok:true};
});
exports.openReview=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.host!==uid||s.phase!=='playing'||Date.now()<s.endsAt)throw new HttpsError('failed-precondition','المراجعة غير متاحة');
 const submissions=(await db.ref('submissions/'+room+'/'+round).get()).val()||{};
 const answers={};for(const id of Object.keys(s.players)){answers[id]=submissions[id]?.answers||Object.fromEntries(activeCats(s).map(c=>[c,'']))}
 const openedAt=Date.now(),ref=db.ref(reviewPath(room,round));
 const challenges={};
 for(const [author,row] of Object.entries(answers)){
   for(const cat of activeCats(s)){
     if(row[cat] && classify(row[cat],cat,s.letter).status==='review'){
       challenges[author]??={};
       challenges[author][cat]={openedBy:'system',openedAt};
     }
   }
 }
 const tx=await ref.transaction(v=>v===null?{answers,openedAt,closesAt:openedAt+45000,status:'review',challenges}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','المراجعة مفتوحة بالفعل');
 await db.ref('rooms/'+room+'/phase').transaction(v=>v==='playing'?'review':undefined);
 return {ok:true,closesAt:openedAt+45000};
});
exports.challengeAnswer=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),author=request.data?.author,category=categoryOf(request.data?.category);
 const s=await stateFor(room,round,uid);
 if(s.phase!=='review'||!s.players?.[author]||author===uid)throw new HttpsError('failed-precondition','الاعتراض غير متاح');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!activeCats(s).includes(category)||!review||review.status!=='review'||Date.now()>=review.closesAt||!review.answers?.[author]?.[category])throw new HttpsError('failed-precondition','انتهت المراجعة أو الإجابة فارغة');
 const tx=await ref.transaction(v=>{if(!v||v.status!=='review'||Date.now()>=v.closesAt||v.challenges?.[author]?.[category])return;v.challenges??={};v.challenges[author]??={};v.challenges[author][category]={openedBy:uid,openedAt:Date.now()};return v;});
 return {ok:true,created:tx.committed};
});
exports.voteAnswer=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),author=request.data?.author,category=categoryOf(request.data?.category),accept=request.data?.accept;
 if(typeof accept!=='boolean')throw new HttpsError('invalid-argument','صوت غير صالح');
 const s=await stateFor(room,round,uid);
 if(s.phase!=='review'||!s.players?.[author]||author===uid)throw new HttpsError('failed-precondition','لا يمكنك التصويت');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!activeCats(s).includes(category)||!review||review.status!=='review'||Date.now()>=review.closesAt||!review.challenges?.[author]?.[category])throw new HttpsError('failed-precondition','التصويت غير متاح');
 if(review.challenges[author][category].openedAt>Date.now())throw new HttpsError('failed-precondition','اعتراض غير صالح');
 // Ballots are stored outside the publicly readable review snapshot.
 const ballotRef=db.ref('ballots/'+room+'/'+round+'/'+author+'/'+category+'/'+uid);
 const tx=await ballotRef.transaction(v=>v===null?{accept,castAt:Date.now()}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','سبق أن صوتّت');
 return {ok:true};
});
exports.finalizeReview=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=roundOf(request.data?.round),s=await stateFor(room,round,uid);
 if(s.host!==uid||s.phase!=='review')throw new HttpsError('failed-precondition','فقط المضيف يمكنه إنهاء المراجعة');
 const ref=db.ref(reviewPath(room,round)),review=(await ref.get()).val();
 if(!review||Date.now()<review.closesAt+2500)throw new HttpsError('failed-precondition','انتظر انتهاء التصويت ومهلة وصول الأصوات');
 // Close review atomically, preventing additional votes.
 const close=await ref.child('status').transaction(v=>v==='review'?'closed':undefined);
 if(!close.committed){const latest=(await ref.child('status').get()).val();if(latest!=='closed')throw new HttpsError('failed-precondition','المراجعة غير متاحة')}
 const closed=(await ref.get()).val(),ids=Object.keys(s.players),decisions={};
 const ballots=(await db.ref('ballots/'+room+'/'+round).get()).val()||{};
 for(const [author,byCategory] of Object.entries(closed.challenges||{})){
   for(const [category,challenge] of Object.entries(byCategory||{})){
     if(!activeCats(s).includes(category)||!ids.includes(author))continue;
     const cast=ballots[author]?.[category]||{},votes={};
     for(const [voter,ballot] of Object.entries(cast))if(ids.includes(voter)&&voter!==author&&typeof ballot?.accept==='boolean'&&ballot.castAt<=closed.closesAt)votes[voter]=ballot.accept;
     const validation=classify(closed.answers?.[author]?.[category],category,s.letter);
     const count=Object.keys(votes).length;
     (decisions[author]??={})[category]=count===0?validation.status==='accepted':voteDecision(votes,author,ids).accepted;
   }
 }
 const {scores,details}=scoreRound(closed.answers||{},decisions,s.letter,activeCats(s),(word,category,letter)=>classify(word,category,letter).status==='accepted');
 // Idempotent room totals transaction; cannot award points twice for the same round.
 const roomRef=db.ref('rooms/'+room);
 const tx=await roomRef.transaction(v=>{
   if(!v||v.round!==round||v.phase!=='review'||v.lastScoredRound===round)return;
   const totals={...(v.totals||{})};
   for(const id of ids)totals[id]=(totals[id]||0)+(scores[id]||0);
   return {...v,phase:'results',lastScoredRound:round,totals,roundScores:scores};
 });
 if(!tx.committed){const latest=(await roomRef.get()).val();if(latest?.lastScoredRound===round)return {ok:true,alreadyFinalized:true,scores:latest.roundScores||{}};throw new HttpsError('aborted','تعذر اعتماد النتائج؛ تحقق من حالة الروم')}
 await ref.child('results').set({scores,details,decisions,finalizedAt:Date.now()});
 // Persist candidate evidence by independent room, idempotently, never as approval.
 // Best effort: scoring must never depend on candidate ingestion.
 try {
   const candidates=candidatesFromReview(closed.answers,decisions,s.letter,classify,activeCats(s));
   for(const item of candidates){
     const id=keyFor(item.category,item.word);
     const candidateRef=db.ref('candidateAnswers/'+id);
     await candidateRef.transaction(existing=>{
       const current=existing||{word:item.word,normalized:item.normalized,category:item.category,locale:'ar',status:'pending',rooms:{}};
       if(current.status!=='pending')return;
       const rooms=current.rooms||{};
       const evidence=rooms[room]||{};
       if(evidence[round])return;
       const next={...evidence,[round]:{accepted:item.accepted,rejected:item.rejected,seenAt:Date.now()}};
       return {...current,rooms:{...rooms,[room]:next},lastSeenAt:Date.now()};
     });
   }
 } catch(err){console.error('Candidate recording failed:',err?.message||err)}

 return {ok:true,scores};
});

/* Category proposals remain private to each room and can be changed only in lobby.
   Never accept a client-authored roundCategories snapshot. */
exports.proposeCategory=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),ref=db.ref('rooms/'+room);
 const name=propose(request.data?.name);
 const tx=await ref.transaction(v=>{
   if(!v||!v.players?.[uid]||!['waiting','results'].includes(v.phase)||v.round>=5)return;
   if((v.categories||DEFAULT).includes(name))return;
   const proposals=v.proposals||{};
   if(Object.values(proposals).some(p=>p.name===name&&p.status==='pending'))return;
   if(Object.keys(proposals).length>=30)return;
   const id='p'+Date.now().toString(36)+uid.slice(0,6);
   return {...v,proposals:{...proposals,[id]:{name,author:uid,status:'pending',createdAt:Date.now()}}};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','تعذر إرسال الاقتراح');
 return {ok:true};
});
exports.decideCategoryProposal=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),id=request.data?.proposalId,accept=request.data?.accept;
 if(typeof id!=='string'||!/^p[a-z0-9]{7,50}$/.test(id)||typeof accept!=='boolean')throw new HttpsError('invalid-argument','طلب غير صالح');
 const ref=db.ref('rooms/'+room);
 const tx=await ref.transaction(v=>{
   if(!v||v.host!==uid||!['waiting','results'].includes(v.phase)||v.round>=5)return;
   const entry=v.proposals?.[id];if(!entry||entry.status!=='pending')return;
   const categories=validate(v.categories||DEFAULT);
   const next=accept?validate([...categories,propose(entry.name,categories)]):categories;
   return {...v,categories:next,proposals:{...v.proposals,[id]:{...entry,status:accept?'accepted':'rejected'}}};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','لا يمكن اعتماد الاقتراح');
 return {ok:true};
});
exports.updateCategories=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room);
 let categories;try{categories=validate(request.data?.categories)}catch(e){throw new HttpsError('invalid-argument',e.message)}
 const ref=db.ref('rooms/'+room);
 const tx=await ref.transaction(v=>{
   if(!v||v.host!==uid||!['waiting','results'].includes(v.phase)||v.round>=5)return;
   return {...v,categories};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','يمكن تعديل الأعمدة قبل الجولة فقط');
 return {ok:true};
});
