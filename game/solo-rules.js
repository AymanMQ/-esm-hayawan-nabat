/* Pure, testable scoring and countdown rules for the five-round solo game. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SoloRules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function scoreRound({categories,answers,computer,letter,bank,discovery,history}){
 if(!Array.isArray(categories)||!bank||!discovery||!history)throw Error('Invalid round inputs');
 let mine=0,theirs=0,discoveries=0;const rows=[];
 for(const cat of categories){
  const answer=String(answers[cat]||'').trim(),bot=String(computer[cat]||'').trim();
  const a=bank.classify(answer,cat,letter),b=bank.classify(bot,cat,letter);
  const duplicate=a.status==='accepted'&&b.status==='accepted'&&bank.normalize(answer)===bank.normalize(bot);
  const minePts=a.status==='accepted'?(duplicate?5:10):0;
  const botPts=b.status==='accepted'?(duplicate?5:10):0;
  const novel=discovery.record(history,cat,answer,a.status==='accepted');
  const bonus=novel?discovery.BONUS:0;
  mine+=minePts+bonus;theirs+=botPts;
  if(novel)discoveries++;
  rows.push({cat,answer,bot,a,minePts,botPts,novel,bonus});
 }
 return {mine,theirs,discoveries,rows};
}
function remainingSeconds(deadline,now){return Math.max(0,Math.ceil((deadline-now)/1000))}
function nextDeadline(deadline,now,botComplete){return botComplete?Math.min(deadline,now+10000):deadline}
function completedCount(schedule,now){return schedule.filter(item=>now>=item.at).length}
return {scoreRound,remainingSeconds,nextDeadline,completedCount};
});
