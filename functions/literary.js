'use strict';
/* Multiplayer literary round: server owns the correct answer, no ballot reads from clients. */
const {questions}=require('./lib/language-questions');
const bank=questions.filter(q=>q.track==='diwaniya');
module.exports=function({onCall,HttpsError,options,db,uidOf,codeOf}){
const roomRef=room=>db.ref('rooms/'+room);
const requireMember=(s,uid)=>{if(!s?.players?.[uid])throw new HttpsError('permission-denied','لست عضوًا في الروم')};
const validateChoice=value=>{if(!Number.isInteger(value)||value<0||value>3)throw new HttpsError('invalid-argument','اختيار غير صالح');return value};
const byId=new Map(bank.map(q=>[q.id,q]));
const startLiteraryRound=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),ref=roomRef(room);
 const state=(await ref.get()).val();requireMember(state,uid);
 if(state.host!==uid)throw new HttpsError('permission-denied','المضيف فقط يبدأ الفقرة');
 if(!['waiting','results'].includes(state.phase)||state.literary?.status==='asking')throw new HttpsError('failed-precondition','انتظر انتهاء الجولة الحالية');
 const used=Array.isArray(state.literaryUsed)?state.literaryUsed:[];
 const available=bank.filter(q=>!used.includes(q.id));
 const selected=(available.length?available:bank)[Math.floor(Math.random()*(available.length||bank.length))];
 const started=Date.now(),endAt=started+30000;
 const tx=await ref.transaction(s=>{
   if(!s||s.host!==uid||!['waiting','results'].includes(s.phase)||s.literary?.status==='asking')return;
   const nextUsed=Array.isArray(s.literaryUsed)?s.literaryUsed:[];
   if(nextUsed.includes(selected.id)&&nextUsed.length<bank.length)return;
   const nextRound=(s.literaryRound||0)+1;
   if(nextRound>30)return;
   return {...s,literaryRound:nextRound,literaryUsed:nextUsed.length>=bank.length?[selected.id]:[...nextUsed,selected.id],
     literary:{status:'asking',round:nextRound,questionId:selected.id,kind:selected.kind,question:selected.q,choices:selected.choices,startedAt:started,endAt}};
 });
 if(!tx.committed)throw new HttpsError('failed-precondition','تعذر بدء الفقرة');
 return {ok:true,round:tx.snapshot.val().literaryRound};
});
const answerLiteraryRound=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),round=request.data?.round,choice=validateChoice(request.data?.choice);
 if(!Number.isInteger(round)||round<1||round>30)throw new HttpsError('invalid-argument','رقم فقرة غير صالح');
 const state=(await roomRef(room).get()).val();requireMember(state,uid);
 if(state.literary?.status!=='asking'||state.literary.round!==round||Date.now()>=state.literary.endAt)throw new HttpsError('failed-precondition','انتهى وقت الإجابة');
 const ref=db.ref('literaryBallots/'+room+'/'+round+'/'+uid);
 const tx=await ref.transaction(old=>old===null&&Date.now()<state.literary.endAt?{choice,castAt:Date.now()}:undefined);
 if(!tx.committed)throw new HttpsError('already-exists','سبق أن أجبت أو انتهى الوقت');
 return {ok:true};
});
const revealLiteraryRound=onCall(options,async request=>{
 const uid=uidOf(request),room=codeOf(request.data?.room),ref=roomRef(room);
 const s=(await ref.get()).val();requireMember(s,uid);
 if(s.host!==uid)throw new HttpsError('permission-denied','المضيف فقط يكشف الإجابة');
 if(s.literary?.status!=='asking')throw new HttpsError('failed-precondition','لا توجد فقرة جارية');
 if(Date.now()<s.literary.endAt+2000)throw new HttpsError('failed-precondition','انتظر انتهاء المؤقت');
 const q=byId.get(s.literary.questionId);
 if(!q)throw new HttpsError('internal','تعذر إيجاد السؤال');
 const votes=(await db.ref('literaryBallots/'+room+'/'+s.literary.round).get()).val()||{};
 const awarded={};
 for(const [player,ballot] of Object.entries(votes)){
   if(s.players[player]&&Number.isInteger(ballot?.choice)&&ballot.castAt<=s.literary.endAt&&ballot.choice===q.answer)awarded[player]=10;
 }
 const tx=await ref.transaction(v=>{
   if(!v||v.host!==uid||v.literary?.status!=='asking'||v.literary.questionId!==q.id||v.literary.round!==s.literary.round)return;
   const scores={...(v.literaryScores||{})};
   for(const [player,points] of Object.entries(awarded))if(v.players[player])scores[player]=(scores[player]||0)+points;
   return {...v,literaryScores:scores,literary:{...v.literary,status:'revealed',correctIndex:q.answer,explanation:q.why,sourceTitle:q.sourceTitle||'فقرة أصلية للعبة',roundScores:awarded,revealedAt:Date.now()}};
 });
 if(!tx.committed){const latest=(await ref.get()).val();if(latest?.literary?.status==='revealed'&&latest.literary.round===s.literary.round)return {ok:true,alreadyRevealed:true};throw new HttpsError('aborted','تعذر اعتماد النتيجة') }
 return {ok:true};
});
return {startLiteraryRound,answerLiteraryRound,revealLiteraryRound};
};
