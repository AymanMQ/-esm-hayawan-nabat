const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const rules=JSON.parse(fs.readFileSync(path.join(root,'database.secure.rules.json'),'utf8')).rules;
const client=fs.readFileSync(path.join(root,'multiplayer-client.js'),'utf8');
const server=fs.readFileSync(path.join(root,'functions/index.js'),'utf8');
test('room reads require membership, not merely sign-in',()=>{
 assert.match(rules.rooms.$room['.read'],/players/);
 assert.match(rules.rooms.$room['.read'],/auth.uid/);
 assert.equal(rules.rooms.$room['.write'],false);
 assert.equal(rules.rooms.$room.players.$uid['.write'],false);
});
test('private submissions and votes are not readable or writable by clients',()=>{
 for(const name of ['submissions','ballots','literaryBallots']){
  assert.equal(rules[name].$room['.read']??rules[name].$room.$round?.['.read'],false);
  assert.equal(rules[name].$room['.write']??rules[name].$room.$round?.['.write'],false);
 }
});
test('room client calls server functions instead of writing membership directly',()=>{
 assert.ok(client.includes("call('createRoom'"));
 assert.ok(client.includes("call('joinRoom'"));
 assert.ok(!client.includes("child('players/'+uid).set("));
 assert.ok(!client.includes("r.once('value')"));
 assert.ok(server.includes("require('./rooms')"));
});
