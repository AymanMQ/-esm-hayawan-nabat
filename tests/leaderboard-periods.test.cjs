const test=require('node:test');
const assert=require('node:assert/strict');
const {periods}=require('../game/leaderboard-periods');
test('Saturday 23:59:59 in Riyadh stays in previous week',()=>{
 const p=periods(Date.UTC(2026,9,17,20,59,59));
 assert.equal(p.weeklyKey,'2026-10-11');
 assert.equal(p.nextWeekUtcMs,Date.UTC(2026,9,17,21));
});
test('Sunday midnight Riyadh begins a new weekly period',()=>{
 const p=periods(Date.UTC(2026,9,17,21));
 assert.equal(p.weeklyKey,'2026-10-18');
 assert.equal(p.weekStartUtcMs,Date.UTC(2026,9,17,21));
 assert.equal(p.nextWeekUtcMs,Date.UTC(2026,9,24,21));
});
test('month changes at 00:00 Riyadh not 00:00 UTC',()=>{
 const before=periods(Date.UTC(2026,9,31,20,59,59));
 const after=periods(Date.UTC(2026,9,31,21));
 assert.equal(before.monthlyKey,'2026-10');
 assert.equal(after.monthlyKey,'2026-11');
 assert.equal(after.monthStartUtcMs,Date.UTC(2026,9,31,21));
 assert.equal(after.nextMonthUtcMs,Date.UTC(2026,10,30,21));
});
test('year boundary and leap-year February',()=>{
 const p=periods(Date.UTC(2023,11,31,21));
 assert.equal(p.monthlyKey,'2024-01');
 assert.equal(p.nextMonthUtcMs,Date.UTC(2024,0,31,21));
 const feb=periods(Date.UTC(2024,1,28,21));
 assert.equal(feb.monthlyKey,'2024-02');
 assert.equal(feb.nextMonthUtcMs,Date.UTC(2024,1,29,21));
});
test('reject invalid timestamps',()=>{
 for(const n of [NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>periods(n),RangeError);
});
