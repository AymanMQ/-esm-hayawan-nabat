/* Candidate word pipeline: pure helpers, never auto-promote. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CandidateWords=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function normalize(value){return String(value||'').normalize('NFC').trim().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ')}
function keyFor(category,word,locale='ar'){const c=normalize(category),w=normalize(word);if(!c||!w||w.length>60||c.length>25)throw Error('Invalid candidate');return encodeURIComponent(locale+'|'+c+'|'+w).replace(/[.%\[\]#$\/]/g,'_')}
function candidatesFromReview(review,decisions,letter,classify,categories){const list=[];for(const [author,answers] of Object.entries(review||{})){for(const category of categories){const word=String(answers?.[category]||'').trim();const initial=normalize(letter),normalized=normalize(word);if(!normalized||!normalized.startsWith(initial))continue;const result=classify(word,category,letter);if(result.status!=='review')continue;const accepted=decisions?.[author]?.[category]===true;const rejected=decisions?.[author]?.[category]===false;list.push({author,category,word,normalized,accepted,rejected,status:'pending'})}}return list}
return {normalize,keyFor,candidatesFromReview};
});
