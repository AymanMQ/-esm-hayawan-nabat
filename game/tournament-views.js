/* Build privacy-conscious bracket views for participating players. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TournamentViews=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function bracketView(event,uid){
 if(!event||!event.players||!Object.prototype.hasOwnProperty.call(event.players,uid))return {registered:false,status:event?.status||'not_opened',registeredCount:Object.keys(event?.players||{}).length};
 const all=event.bracket?.openingMatches||[];
 const myMatch=all.find(m=>Array.isArray(m.players)&&m.players.includes(uid));
 const publicNames=id=>({name:String(event.players[id]?.name||'لاعب').slice(0,25),isYou:id===uid});
 const match=myMatch?{matchNumber:myMatch.matchNumber,players:myMatch.players.map(publicNames)}:null;
 return {registered:true,status:event.status,registeredCount:Object.keys(event.players).length,capacity:event.bracket?.capacity||null,format:event.groupSize||null,match,stageCount:event.bracket?.rounds?.length||0,waitlisted:!myMatch&&Boolean(event.bracket?.waitlist?.includes(uid))};
}
return {bracketView};
});
