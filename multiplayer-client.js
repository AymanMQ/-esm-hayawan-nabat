(()=>{'use strict';
const $=id=>document.getElementById(id),categoryRules=window.GameCategories;let cats=[...categoryRules.DEFAULT];let db,fn,uid,room,roomRef,roomListener,reviewRef,reviewListener,offset=0,round=0,deadline=0,ticker=null,submitted=false,players={},host=false,currentPhase='',lastRound=0,reviewData=null,latestCategories=[...cats],literaryState=null,lastLiteraryRound=0,dismissedLiteraryRound=0,literarySubmittedRound=0;
const show=id=>['welcome','lobby','game','done','review','scores','literary'].forEach(x=>$(x)?.classList.toggle('hide',x!==id));
function msg(e){$('error').textContent=typeof e==='string'?e:(e.message||String(e));$('error').classList.remove('hide')}
function clear(){ $('error').classList.add('hide')}
function config(){let c=window.FADAWAH_FIREBASE_CONFIG;if(!c?.apiKey||!c?.databaseURL||!c?.projectId)throw Error('لم تتم إضافة إعدادات Firebase للويب بعد');return c}
async function init(){if(db)return;if(!window.firebase?.functions)throw Error('تعذر تحميل Firebase');if(!firebase.apps.length)firebase.initializeApp(config());db=firebase.database();fn=firebase.app().functions('asia-southeast1');db.ref('.info/serverTimeOffset').on('value',s=>offset=s.val()||0);uid=(firebase.auth().currentUser||(await firebase.auth().signInAnonymously()).user).uid}
const call=async(name,data)=>{const res=await fn.httpsCallable(name)(data);return res.data};
function name(){const n=$('name').value.trim();if(n.length<2)throw Error('الاسم يجب أن يحتوي على حرفين على الأقل');localStorage.setItem('eshn_name',n);return n}
function code(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}
async function create(){clear();try{const n=name();await init();let created;for(let i=0;i<12;i++){const k=code(),r=db.ref('rooms/'+k);const tx=await r.transaction(v=>v===null?{host:uid,phase:'waiting',round:0,players:{[uid]:{name:n,joinedAt:firebase.database.ServerValue.TIMESTAMP}}}:undefined,undefined,false);if(tx.committed){created=k;break}}if(!created)throw Error('تعذر إنشاء الروم');watch(created)}catch(e){msg(e)}}
async function join(){clear();try{const n=name();await init();const k=$('codeInput').value.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(k))throw Error('أدخل كودًا من ٦ رموز');const r=db.ref('rooms/'+k),s=(await r.once('value')).val();if(!s)throw Error('الروم غير موجود');if(s.phase!=='waiting'&&!s.players?.[uid])throw Error('اللعبة بدأت، انتظر الجولة القادمة');await r.child('players/'+uid).set({name:n,joinedAt:firebase.database.ServerValue.TIMESTAMP});watch(k)}catch(e){msg(e)}}
function stopWatch(){if(roomRef&&roomListener)roomRef.off('value',roomListener);if(reviewRef&&reviewListener)reviewRef.off('value',reviewListener);roomRef=reviewRef=null;roomListener=reviewListener=null;clearInterval(ticker)}
function watch(k){stopWatch();room=k;show('lobby');roomRef=db.ref('rooms/'+k);roomListener=roomRef.on('value',s=>{const v=s.val();if(!v){msg('أُغلق الروم');show('welcome');return}players=v.players||{};host=v.host===uid;round=v.round||0;currentPhase=v.phase;literaryState=v.literary||null;latestCategories=v.categories||categoryRules.DEFAULT;cats=v.roundCategories||latestCategories;renderCategorySetup(v);$('roomCode').textContent=k;$('players').replaceChildren();Object.entries(players).forEach(([id,p])=>{const tag=document.createElement('span');tag.className='person';tag.textContent=(id===v.host?'👑 ':'')+p.name;$('players').append(tag)});$('start').classList.toggle('hide',!host||!['waiting','results'].includes(v.phase)||round>=5);$('startLiterary').classList.toggle('hide',!host||!['waiting','results'].includes(v.phase)||v.literary?.status==='asking');$('status').textContent=v.phase==='waiting'?'ننتظر المضيف يبدأ الجولة…':v.phase==='playing'?'الجولة جارية':v.phase==='review'?'وقت مراجعة الإجابات':'انتهت الجولة';if(v.literary?.round&&v.literary.round>lastLiteraryRound){lastLiteraryRound=v.literary.round;dismissedLiteraryRound=0;literarySubmittedRound=0}if(v.literary?.status==='asking'||v.literary?.status==='revealed'&&dismissedLiteraryRound!==v.literary.round){renderLiterary(v);show('literary');return}if(v.phase==='playing'){if(lastRound!==round){if(reviewRef&&reviewListener)reviewRef.off('value',reviewListener);reviewRef=null;reviewListener=null;reviewData=null;lastRound=round;begin(v)}else if(!submitted)show('game')}else if(v.phase==='review'){listenReview();show('review')}else if(v.phase==='results'){listenReview();show('scores');renderScores(v)}else show('lobby')});}
function renderLiterary(state){
 const q=state.literary;if(!q)return;
 const asking=q.status==='asking',remaining=Math.max(0,Math.ceil((q.endAt-Date.now()-offset)/1000));
 $('literaryProgress').textContent='الفقرة '+q.round+' — '+q.kind;
 $('literaryQuestion').textContent=q.question;
 $('literaryClock').textContent=asking?'الوقت المتبقي: '+remaining+' ثانية':'اكتملت الفقرة';
 $('literaryChoices').replaceChildren();
 for(const [index,choice] of (q.choices||[]).entries()){
   const button=document.createElement('button');button.type='button';button.className='literary-choice';button.textContent=choice;
   if(!asking&&index===q.correctIndex)button.classList.add('selected');
   button.disabled=!asking||literarySubmittedRound===q.round||remaining===0;
   button.onclick=async()=>{button.disabled=true;try{await call('answerLiteraryRound',{room,round:q.round,choice:index});literarySubmittedRound=q.round;$('literaryStatus').textContent='وصلت إجابتك ✓';renderLiterary({literary:q,players:state.players,literaryScores:state.literaryScores})}catch(e){msg(e);button.disabled=false}};
   $('literaryChoices').append(button);
 }
 $('literaryStatus').textContent=asking?(literarySubmittedRound===q.round?'وصلت إجابتك ✓':'اختر إجابة واحدة، لن تُكشف حتى نهاية الوقت.'):'انتهى الوقت وكُشفت الإجابة.';
 $('revealLiterary').classList.toggle('hide',!asking||!host);
 $('revealLiterary').disabled=remaining>0;
 $('literaryExplanation').textContent=asking?'':'💡 '+(q.explanation||'')+' — '+(q.sourceTitle||'');
 $('literaryScores').replaceChildren();
 if(!asking)for(const [id,player] of Object.entries(state.players||{})){
   const p=document.createElement('p');p.textContent=player.name+': '+(state.literaryScores?.[id]||0)+' نقطة';$('literaryScores').append(p);
 }
 $('literaryBack').classList.toggle('hide',asking);
}
async function startLiterary(){try{$('startLiterary').disabled=true;await call('startLiteraryRound',{room})}catch(e){msg(e)}finally{$('startLiterary').disabled=false}}
async function revealLiterary(){try{$('revealLiterary').disabled=true;await call('revealLiteraryRound',{room})}catch(e){msg(e)}finally{$('revealLiterary').disabled=false}}
function backFromLiterary(){if(literaryState?.status!=='revealed')return;dismissedLiteraryRound=literaryState.round;show('lobby')}

function renderCategorySetup(state){
 const editable=host&&['waiting','results'].includes(state.phase)&&state.round<5;
 const allowed=['waiting','results'].includes(state.phase)&&state.round<5;
 $('categorySetup').classList.toggle('hide',!allowed);
 $('hostCategories').classList.toggle('hide',!editable);
 $('categoryList').replaceChildren();
 for(const cat of latestCategories){
  const item=document.createElement('span');item.className='category-chip';item.textContent=cat;
  if(editable&&latestCategories.length>3){
   const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='إزالة '+cat;
   remove.onclick=()=>setCategories(latestCategories.filter(c=>c!==cat));item.append(remove);
  }
  $('categoryList').append(item);
 }
 $('categoryPresets').replaceChildren();
 if(editable)for(const cat of categoryRules.PRESETS){
  if(latestCategories.includes(cat))continue;
  const button=document.createElement('button');button.type='button';button.className='btn secondary';button.style.width='auto';button.textContent='+ '+cat;
  button.disabled=latestCategories.length>=categoryRules.MAX_CATEGORIES;
  button.onclick=()=>setCategories([...latestCategories,cat]);$('categoryPresets').append(button);
 }
 $('categorySuggestion').disabled=!allowed;
 $('sendProposal').disabled=!allowed;
 $('proposals').replaceChildren();
 for(const [proposalId,p] of Object.entries(state.proposals||{})){
  if(p.status!=='pending')continue;
  const item=document.createElement('div');item.className='proposal';
  const title=document.createElement('strong');title.textContent=p.name+' — اقتراح من '+(players[p.author]?.name||'مشارك');item.append(title);
  if(editable){
   for(const [label,accept] of [['موافق ✓',true],['رفض ×',false]]){
    const button=document.createElement('button');button.type='button';button.className='btn secondary';button.textContent=label;
    button.onclick=()=>decideProposal(proposalId,accept);item.append(button);
   }
  }
  $('proposals').append(item);
 }
 $('categoryNote').textContent=editable?'أنت المضيف: يمكنك تعديل الورقة الآن.':'أي تعديل يحتاج موافقة المضيف قبل الجولة.';
}
async function setCategories(categories){try{await call('updateCategories',{room,categories})}catch(e){msg(e)}}
async function proposeCategory(){
 try{const name=categoryRules.propose($('categorySuggestion').value,latestCategories);await call('proposeCategory',{room,name});$('categorySuggestion').value=''}catch(e){msg(e)}
}
async function decideProposal(proposalId,accept){try{await call('decideCategoryProposal',{room,proposalId,accept})}catch(e){msg(e)}}
function begin(v){cats=categoryRules.validate(v.roundCategories||categoryRules.DEFAULT);clearInterval(ticker);submitted=false;deadline=v.endsAt;$('submit').disabled=false;$('saveState').textContent='';$('round').textContent=v.round;$('letter').textContent=v.letter;$('fields').replaceChildren();cats.forEach((cat,i)=>{const label=document.createElement('label');label.htmlFor='f'+i;label.textContent=cat;const input=document.createElement('input');input.id='f'+i;input.maxLength=60;input.placeholder='اكتب '+cat+'…';$('fields').append(label,input)});show('game');tick();ticker=setInterval(tick,250)}
function tick(){if(submitted)return;const n=Math.max(0,Math.ceil((deadline-Date.now()-offset)/1000));$('clock').textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');if(n===0){clearInterval(ticker);submit();if(host){$('openReview').classList.remove('hide')}}}
async function start(){clear();try{$('start').disabled=true;await call('startRound',{room})}catch(e){msg(e)}finally{$('start').disabled=false}}
async function submit(){if(submitted||!room)return;submitted=true;clearInterval(ticker);$('submit').disabled=true;const answers={};cats.forEach((cat,i)=>answers[cat]=$('f'+i).value.trim());try{await call('submitAnswers',{room,round,answers});show('done')}catch(e){msg(e);$('saveState').textContent='تعذر التسليم؛ قد يكون الوقت انتهى';show('done')}}
function listenReview(){const path='reviews/'+room+'/'+round;if(reviewRef&&reviewRef.toString()!==db.ref(path).toString()){reviewRef.off('value',reviewListener);reviewRef=null;reviewListener=null}if(reviewRef)return;reviewRef=db.ref(path);reviewListener=reviewRef.on('value',s=>{reviewData=s.val();if(currentPhase==='review')renderReview();else if(currentPhase==='results')renderScores()})}
function renderReview(){const box=$('reviewAnswers');box.replaceChildren();if(!reviewData){box.textContent='انتظر كشف الإجابات…';return}const remaining=Math.max(0,Math.ceil((reviewData.closesAt-Date.now()-offset)/1000));$('reviewStatus').textContent='تبقى للمراجعة: '+remaining+' ثانية';for(const cat of cats){const title=document.createElement('h3');title.textContent=cat;box.append(title);for(const [author,ans] of Object.entries(reviewData.answers||{})){const val=ans[cat]||'—',line=document.createElement('div');line.className='person';line.style.margin='7px 0';const txt=document.createElement('span');txt.textContent=(players[author]?.name||'لاعب')+': '+val;line.append(txt);const challenged=reviewData.challenges?.[author]?.[cat];if(author!==uid&&val!=='—'&&remaining>0){if(challenged){const controls=document.createElement('div');controls.className='vote-options';const yes=document.createElement('button');yes.type='button';yes.className='vote-yes';yes.textContent='👍 تمشي';yes.onclick=()=>vote(author,cat,true);const no=document.createElement('button');no.type='button';no.className='vote-no';no.textContent='👎 ما تمشي';no.onclick=()=>vote(author,cat,false);controls.append(yes,no);line.append(controls)}else{const b=document.createElement('button');b.className='btn secondary';b.textContent='اعترض 🤨';b.onclick=()=>challenge(author,cat);line.append(b)}}if(challenged){const note=document.createElement('small');note.textContent=' اعتراض مفتوح';line.append(note)}box.append(line)}}$('finalize').classList.toggle('hide',!host);$('finalize').disabled=remaining>0}
async function challenge(author,category){try{await call('challengeAnswer',{room,round,author,category})}catch(e){msg(e)}}
async function vote(author,category,accept){try{await call('voteAnswer',{room,round,author,category,accept});$('reviewStatus').textContent='تم تسجيل صوتك ✓'}catch(e){msg(e)}}
async function openReview(){try{await call('openReview',{room,round})}catch(e){msg(e)}}
async function finalize(){try{await call('finalizeReview',{room,round})}catch(e){msg(e)}}
let latestRoomState=null;function renderScores(state){if(state)latestRoomState=state;const box=$('scoreRows');box.replaceChildren();const totals=latestRoomState?.totals||{};Object.entries(players).sort((a,b)=>(totals[b[0]]||0)-(totals[a[0]]||0)).forEach(([id,p],i)=>{const row=document.createElement('p');row.textContent=(i+1)+'. '+p.name+' — '+(totals[id]||0)+' نقطة';box.append(row)});$('nextRound').classList.toggle('hide',!host||round>=5);$('gameOver').textContent=round>=5?'خلصت المباراة! 🏆':'انتهت الجولة — الجولة التالية عند المضيف'}
function leave(){stopWatch();room=null;lastRound=0;lastLiteraryRound=0;dismissedLiteraryRound=0;submitted=false;show('welcome')}
$('name').value=localStorage.getItem('eshn_name')||'';$('create').onclick=create;$('join').onclick=join;$('start').onclick=start;$('submit').onclick=submit;$('leave').onclick=leave;$('backLobby').onclick=()=>show('done');$('openReview').onclick=openReview;$('finalize').onclick=finalize;$('nextRound').onclick=start;$('startLiterary').onclick=startLiterary;$('revealLiterary').onclick=revealLiterary;$('literaryBack').onclick=backFromLiterary;$('sendProposal').onclick=proposeCategory;$('resetCategories').onclick=()=>setCategories(categoryRules.DEFAULT);
setInterval(()=>{if(literaryState?.status==='asking'&&room)renderLiterary({literary:literaryState,players,literaryScores:{}});if(currentPhase==='review'&&reviewData)renderReview();if(currentPhase==='playing'&&submitted&&host&&Date.now()+offset>=deadline){$('openReview').classList.remove('hide')}else $('openReview').classList.add('hide')},1000);
})();