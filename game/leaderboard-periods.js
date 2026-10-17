/* Pure leaderboard period boundaries for Asia/Riyadh (UTC+03:00, no DST). 
 * Period keys are advisory on the client: server must validate score, timestamp,
 * and period before writing official leaderboards.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LeaderboardPeriods=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const OFFSET_MS=3*60*60*1000;
const DAY_MS=24*60*60*1000;
function check(timeMs){
  if(!Number.isSafeInteger(timeMs)||!Number.isFinite(new Date(timeMs).getTime()))
    throw new RangeError('Invalid timestamp');
}
function pad(n){return String(n).padStart(2,'0')}
function key(date){return date.getUTCFullYear()+'-'+pad(date.getUTCMonth()+1)+'-'+pad(date.getUTCDate())}
function periods(timeMs){
  check(timeMs);
  const local=new Date(timeMs+OFFSET_MS);
  const year=local.getUTCFullYear(),month=local.getUTCMonth(),day=local.getUTCDate();
  const localMidnight=Date.UTC(year,month,day);
  const weekday=local.getUTCDay(); // Sunday=0
  const weekStartUtcMs=localMidnight-weekday*DAY_MS-OFFSET_MS;
  const monthStartUtcMs=Date.UTC(year,month,1)-OFFSET_MS;
  const nextMonthUtcMs=Date.UTC(year,month+1,1)-OFFSET_MS;
  return {
    timezone:'Asia/Riyadh',
    weeklyKey:key(new Date(weekStartUtcMs+OFFSET_MS)),
    monthlyKey:year+'-'+pad(month+1),
    weekStartUtcMs,
    nextWeekUtcMs:weekStartUtcMs+7*DAY_MS,
    monthStartUtcMs,
    nextMonthUtcMs
  };
}
return {periods};
});
