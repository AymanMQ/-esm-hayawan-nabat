const test=require('node:test'),assert=require('node:assert/strict'),p=require('../game/ranking-periods.js');
test('Saudi weekly reset is Sunday at midnight',()=>{const before=Date.parse('2026-10-17T20:59:59Z'),after=Date.parse('2026-10-17T21:00:00Z');assert.notEqual(p.week(before).id,p.week(after).id);assert.equal(p.week(after).id,'2026-10-18')});
test('Saudi monthly reset is local first day',()=>{assert.equal(p.month(Date.parse('2026-10-31T20:59:59Z')).id,'2026-10');assert.equal(p.month(Date.parse('2026-10-31T21:00:00Z')).id,'2026-11')});
test('period end exclusive and consecutive',()=>{const now=Date.parse('2026-10-17T10:00:00Z');for(const type of ['week','month']){const current=p.period(type,now);assert.ok(current.start<=now&&current.end>now);assert.equal(p.period(type,current.end).start,current.end)}});
test('reject bad input',()=>assert.throws(()=>p.period('day',Date.now()),/Unknown/));
