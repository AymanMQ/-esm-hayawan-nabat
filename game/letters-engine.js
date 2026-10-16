/* Shared pure game rules — no Firebase dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LettersEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CATEGORIES=['اسم','حيوان','نبات','جماد','بلاد'];
const LETTERS=['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','هـ','و','ي'];
function normalize(s){return String(s||'').trim().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ');}
function matchesLetter(word,letter){return !!normalize(word)&&normalize(word).startsWith(normalize(letter));}
function voteDecision(votes,authorId,players){const eligible=players.filter(id=>id!==authorId);let yes=0,no=0;for(const id of eligible){if(votes[id]===true)yes++;if(votes[id]===false)no++;}return {yes,no,eligible:eligible.length,complete:yes+no===eligible.length,accepted:yes>=no};}
function scoreRound(submissions,decisions,letter,categories=CATEGORIES){const ids=Object.keys(submissions),scores=Object.fromEntries(ids.map(id=>[id,0])),details={};for(const cat of categories){const valid=[];for(const id of ids){const raw=submissions[id]?.[cat]||'',key=normalize(raw);const allowed=decisions[id]?.[cat]!==false;if(matchesLetter(raw,letter)&&allowed)valid.push({id,key,raw});}const count=new Map();valid.forEach(x=>count.set(x.key,(count.get(x.key)||0)+1));for(const id of ids){const x=valid.find(a=>a.id===id);const pts=x?(count.get(x.key)>1?5:10):0;scores[id]+=pts;(details[id]??={})[cat]=pts;}}return {scores,details};}
return {CATEGORIES,LETTERS,normalize,matchesLetter,voteDecision,scoreRound};
});
