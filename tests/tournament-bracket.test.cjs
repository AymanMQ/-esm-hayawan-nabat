const test=require('node:test');const assert=require('node:assert/strict');const b=require('../game/tournament-bracket');
for(const [n,size,expected] of [[16,2,[8,4,2,1]],[27,3,[9,3,1]],[25,5,[5,1]]])test(n+' entrants, '+size+' per match',()=>{const plan=b.planTournament(Array.from({length:n},(_,i)=>'p'+i),size);assert.equal(plan.status,'ready');assert.deepEqual(plan.rounds.map(x=>x.matches),expected);assert.equal(plan.openingMatches.length,n/size)});
test('unfilled bracket chooses prior full capacity and puts others on waitlist',()=>{const p=b.planTournament(Array.from({length:20},(_,i)=>'p'+i),3);assert.equal(p.capacity,9);assert.equal(p.waitlist.length,11)});
test('cannot start with fewer than group size',()=>assert.equal(b.planTournament(['p1'],3).status,'insufficient'));
test('duplicate ids rejected',()=>assert.throws(()=>b.planTournament(['p','p'],2),/duplicate/));
test('tie triggers tiebreak, not arbitrary winner',()=>assert.deepEqual(b.resolveMatch(['a','b','c'],{a:10,b:20,c:20}),{status:'tiebreak',players:['b','c'],score:20}));
test('single verified top player qualifies',()=>assert.equal(b.resolveMatch(['a','b'],{a:25,b:20}).winner,'a'));
test('invalid scores never qualify',()=>assert.throws(()=>b.resolveMatch(['a','b'],{a:10,b:undefined}),/Unverified/));
