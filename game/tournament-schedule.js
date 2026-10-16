/* Pure hourly tournament schedule. Registration and outcomes require trusted server. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TournamentSchedule=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const FORMATS=[2,3,5],HOUR=3600000;
function nextHour(afterMs){if(!Number.isFinite(afterMs))throw Error('Invalid time');return (Math.floor(afterMs/HOUR)+1)*HOUR}
function eventId(startMs,groupSize){if(!FORMATS.includes(groupSize)||!Number.isSafeInteger(startMs)||startMs%HOUR!==0)throw Error('Invalid tournament event');return 'hourly-'+startMs+'-g'+groupSize}
function upcoming(fromMs,count=3){if(!Number.isFinite(fromMs)||!Number.isInteger(count)||count<1||count>24)throw Error('Invalid schedule request');const base=nextHour(fromMs);return Array.from({length:count},(_,i)=>{const startsAt=base+i*HOUR;return {startsAt,registrationClosesAt:startsAt-60000,formats:FORMATS.map(groupSize=>({id:eventId(startsAt,groupSize),groupSize}))}})}
function registrationOpen(now,ev){return Number.isFinite(now)&&now<ev.registrationClosesAt&&now>=ev.startsAt-HOUR}
return {FORMATS,HOUR,nextHour,eventId,upcoming,registrationOpen};
});
