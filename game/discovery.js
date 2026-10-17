/* Local discovery rules: award novelty only for a validated answer first used in its category. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WordDiscovery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const BONUS=5,VERSION=1;
function normalize(s){return String(s||'').trim().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ')}
function key(category,word){return JSON.stringify([String(category||'').trim(),normalize(word)])}
function clean(raw){if(!raw||raw.version!==VERSION||!raw.entries||typeof raw.entries!=='object'||Array.isArray(raw.entries))return {version:VERSION,entries:{}};const entries={};for(const [k,v] of Object.entries(raw.entries)){if(typeof k==='string'&&k.length<180&&v&&typeof v.word==='string'&&typeof v.category==='string')entries[k]={word:v.word.slice(0,60),category:v.category.slice(0,25)}}return {version:VERSION,entries}}
function isNew(history,category,word,valid){return !!valid&&!!normalize(word)&&!Object.prototype.hasOwnProperty.call(history.entries,key(category,word))}
function record(history,category,word,valid){if(!isNew(history,category,word,valid))return false;history.entries[key(category,word)]={category,word:String(word).trim()};return true}
function count(history){return Object.keys(history.entries).length}
return {BONUS,VERSION,normalize,key,clean,isNew,record,count};
});
