const test=require('node:test'),assert=require('node:assert/strict'),s=require('../game/tournament-schedule');
test('next full hour in UTC milliseconds',()=>assert.equal(s.nextHour(Date.UTC(2026,9,16,13,23)),Date.UTC(2026,9,16,14)));
test('exact hour moves forward',()=>assert.equal(s.nextHour(Date.UTC(2026,9,16,14)),Date.UTC(2026,9,16,15)));
test('formats are only 2,3,5',()=>assert.deepEqual(s.upcoming(Date.UTC(2026,9,16,13,30),1)[0].formats.map(x=>x.groupSize),[2,3,5]));
test('registration closes one minute before scheduled start',()=>{const event=s.upcoming(Date.UTC(2026,9,16,13,30),1)[0];assert.equal(event.registrationClosesAt,event.startsAt-60000);assert.equal(s.registrationOpen(event.startsAt-61000,event),true);assert.equal(s.registrationOpen(event.startsAt-59000,event),false)});
test('stable event ids per hour and size',()=>{const ev=s.upcoming(Date.UTC(2026,9,16,13,30),1)[0];assert.notEqual(ev.formats[0].id,ev.formats[1].id)});
