/* Deterministic tournament bracket planner. Server must own participant seed/order. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TournamentBracket=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const GROUP_SIZES=[2,3,5];
function validateGroupSize(n){if(!GROUP_SIZES.includes(n))throw Error('Tournament match size must be 2, 3 or 5');return n}
function capacityFor(groupSize,registered,max=625){validateGroupSize(groupSize);if(!Number.isSafeInteger(registered)||registered<0)throw Error('Invalid registrations');let capacity=groupSize;while(capacity*groupSize<=registered&&capacity*groupSize<=max)capacity*=groupSize;return registered>=groupSize?capacity:0}
function roundsFor(capacity,groupSize){validateGroupSize(groupSize);if(!Number.isSafeInteger(capacity)||capacity<groupSize)throw Error('Invalid capacity');let remaining=capacity,rounds=[];while(remaining>1){if(remaining%groupSize)throw Error('Uneven bracket; do not invent ghost players');rounds.push({players:remaining,matches:remaining/groupSize,qualifyPerMatch:1});remaining/=groupSize;}return rounds}
function planTournament(playerIds,groupSize,limit=625){
 validateGroupSize(groupSize);if(!Array.isArray(playerIds))throw Error('Participants must be an array');
 if(playerIds.some(id=>typeof id!=='string'||!id||id.length>128)||new Set(playerIds).size!==playerIds.length)throw Error('Invalid or duplicate players');
 const capacity=capacityFor(groupSize,playerIds.length,limit);
 if(!capacity)return {status:'insufficient',groupSize,capacity:0,waitlist:playerIds.slice(),rounds:[]};
 const seeded=playerIds.slice(0,capacity),waitlist=playerIds.slice(capacity);
 const matches=[];
 for(let i=0;i<seeded.length;i+=groupSize)matches.push({matchNumber:matches.length+1,players:seeded.slice(i,i+groupSize)});
 return {status:'ready',groupSize,capacity,waitlist,rounds:roundsFor(capacity,groupSize),openingMatches:matches};
}
function resolveMatch(players,scores){if(!Array.isArray(players)||!players.length)throw Error('Missing players');const entries=players.map(id=>({id,score:scores?.[id]}));if(entries.some(x=>!Number.isFinite(x.score)||x.score<0))throw Error('Unverified score');const highest=Math.max(...entries.map(x=>x.score)),leaders=entries.filter(x=>x.score===highest).map(x=>x.id);return leaders.length===1?{status:'winner',winner:leaders[0],score:highest}:{status:'tiebreak',players:leaders,score:highest};}
function advanceRound(matches,scoresByMatch,groupSize){
 validateGroupSize(groupSize);
 if(!Array.isArray(matches)||!matches.length)throw Error('Missing matches');
 const winners=[],tiebreaks=[];
 matches.forEach((match,index)=>{
   if(!Array.isArray(match.players)||match.players.length!==groupSize||new Set(match.players).size!==groupSize)throw Error('Invalid match');
   const scores=scoresByMatch?.[match.matchNumber];
   if(!scores)throw Error('Match scores not yet verified');
   const result=resolveMatch(match.players,scores);
   if(result.status==='tiebreak')tiebreaks.push({matchNumber:match.matchNumber,players:result.players});
   else winners.push(result.winner);
 });
 if(tiebreaks.length)return {status:'tiebreak',tiebreaks,winners:[]};
 if(winners.length===1)return {status:'champion',champion:winners[0],winners};
 if(winners.length%groupSize!==0)throw Error('Invalid bracket progression');
 const nextMatches=[];
 for(let i=0;i<winners.length;i+=groupSize)nextMatches.push({matchNumber:i/groupSize+1,players:winners.slice(i,i+groupSize)});
 return {status:'next_round',winners,nextMatches};
}
return {GROUP_SIZES,capacityFor,roundsFor,planTournament,resolveMatch,advanceRound};
});
