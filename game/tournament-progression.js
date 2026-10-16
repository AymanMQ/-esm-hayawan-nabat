/* Trusted tournament state transitions: pure engine; never accept scores from browsers.
 * Adapted for two-, three- and five-player knockout matches.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TournamentProgression=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const {advanceRound}=typeof require==='function'?require('./tournament-bracket'):globalThis.TournamentBracket;
function startBracket(plan,eventId){
 if(!plan||plan.status!=='ready'||!Array.isArray(plan.openingMatches)||!plan.openingMatches.length)throw Error('No finalized bracket');
 const matches=plan.openingMatches.map(m=>({id:eventId+'-r1-m'+m.matchNumber,matchNumber:m.matchNumber,players:m.players.slice(),status:'pending',scores:null}));
 return {round:1,status:'matches_pending',matches,history:[],champion:null,groupSize:plan.groupSize};
}
function recordVerifiedMatch(state,matchId,scores,verification){
 if(!verification||verification.trustedServer!==true||typeof verification.sourceId!=='string'||!verification.sourceId)throw Error('Verified server result required');
 if(state?.status!=='matches_pending')throw Error('Tournament not accepting results');
 const idx=state.matches.findIndex(m=>m.id===matchId);
 if(idx<0)throw Error('Unknown match');
 const current=state.matches[idx];
 if(current.status==='complete'){
   if(current.verificationId===verification.sourceId)return state;
   throw Error('Match already recorded');
 }
 const keys=Object.keys(scores||{});
 if(keys.length!==current.players.length||keys.some(id=>!current.players.includes(id)))throw Error('Invalid score participants');
 const result=advanceRound([{matchNumber:current.matchNumber,players:current.players}],{[current.matchNumber]:scores},current.players.length);
 const completed={...current,status:result.status==='tiebreak'?'tiebreak':'complete',scores:{...scores},verificationId:verification.sourceId,verificationRound:verification.sourceRound??null,winner:result.winners?.[0]??null,tiedPlayers:result.tiebreaks?.[0]?.players??null};
 return {...state,matches:state.matches.map((m,i)=>i===idx?completed:m)};
}
function completeRound(state,eventId){
 if(state?.status!=='matches_pending')throw Error('No active tournament round');
 if(state.matches.some(m=>m.status==='pending'))return {status:'waiting',state};
 if(state.matches.some(m=>m.status==='tiebreak'))return {status:'tiebreak',state,tiebreaks:state.matches.filter(m=>m.status==='tiebreak').map(m=>({matchId:m.id,players:m.tiedPlayers}))};
 const winningIds=state.matches.map(m=>m.winner);
 const history=[...state.history,{round:state.round,matches:state.matches}];
 if(winningIds.length===1)return {status:'champion',state:{...state,status:'completed',matches:[],history,champion:winningIds[0]}};
 if(winningIds.length%state.groupSize)throw Error('Bracket not divisible');
 const nextRound=state.round+1,matches=[];
 for(let i=0;i<winningIds.length;i+=state.groupSize){
   const matchNumber=matches.length+1;
   matches.push({id:eventId+'-r'+nextRound+'-m'+matchNumber,matchNumber,players:winningIds.slice(i,i+state.groupSize),status:'pending',scores:null});
 }
 return {status:'next_round',state:{...state,round:nextRound,matches,history}};
}
return {startBracket,recordVerifiedMatch,completeRound};
});
