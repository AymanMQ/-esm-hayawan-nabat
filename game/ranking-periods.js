/* Ranking periods use Saudi Arabia local midnight (UTC+03:00; no DST). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RankingPeriods=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const OFFSET=3*60*60*1000,DAY=24*60*60*1000;
function valid(ts){if(!Number.isFinite(ts)||!Number.isSafeInteger(ts))throw Error('Invalid timestamp');return ts}
function parts(ts){const local=new Date(valid(ts)+OFFSET);return {year:local.getUTCFullYear(),month:local.getUTCMonth()+1,day:local.getUTCDate(),weekday:local.getUTCDay()}}
function week(ts){const {year,month,day,weekday}=parts(ts);const startDay=Date.UTC(year,month-1,day)-((weekday+6)%7)*DAY;const d=new Date(startDay);const start=startDay-OFFSET;return {type:'week',id:d.toISOString().slice(0,10),start,end:start+7*DAY}}
function month(ts){const {year,month}=parts(ts),start=Date.UTC(year,month-1,1)-OFFSET,end=Date.UTC(year,month,1)-OFFSET;return {type:'month',id:String(year)+'-'+String(month).padStart(2,'0'),start,end}}
function period(type,ts){if(type==='week')return week(ts);if(type==='month')return month(ts);throw Error('Unknown period')}
return {week,month,period};
});
