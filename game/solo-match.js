/* Deterministic five-round match state. No browser or Firebase dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SoloMatch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LIMIT=5;
function create(){return {round:0,phase:'ready',totals:[0,0],completed:[],discoveries:0}}
function begin(state){if(!state||!['ready','results'].includes(state.phase)||state.round>=LIMIT)return false;state.round++;state.phase='playing';return true}
function commit(state,{mine,theirs,discoveries=0}){
 if(!state||state.phase!=='playing'||state.round<1||state.round>LIMIT)return false;
 if(![mine,theirs,discoveries].every(x=>Number.isSafeInteger(x)&&x>=0))throw Error('Invalid points');
 if(state.completed.includes(state.round))return false;
 state.completed.push(state.round);state.totals[0]+=mine;state.totals[1]+=theirs;
 state.discoveries+=discoveries;state.phase='results';return true;
}
function finish(state){if(!state||state.phase!=='results'||state.round!==LIMIT||state.completed.length!==LIMIT)return false;state.phase='ended';return true}
function winner(state){if(!state||state.phase!=='ended')throw Error('Match not complete');return state.totals[0]>state.totals[1]?'player':state.totals[0]<state.totals[1]?'opponent':'tie'}
function leave(state){if(state)state.phase='abandoned'}
return {LIMIT,create,begin,commit,finish,winner,leave};
});
