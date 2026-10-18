'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));

test('Firebase deployment targets the reviewed secure database rules', () => {
  const config = read('firebase.json');
  assert.equal(config.database?.rules, 'database.secure.rules.json',
    'Never deploy the legacy, client-writable database.rules.json by accident');
  const rules = read(config.database.rules).rules;
  assert.equal(rules.rooms.$room['.write'], false);
  assert.equal(rules.rooms.$room.players.$uid['.write'], false);
  assert.match(rules.rooms.$room['.read'], /auth\.uid/);
  for (const node of ['submissions', 'ballots', 'literaryBallots']) {
    const scope = node === 'literaryBallots'
      ? rules[node].$room
      : node === 'ballots' ? rules[node].$room.$round : rules[node].$room.$round.$uid;
    assert.equal(scope['.read'], false, node + ' must be private');
    assert.equal(scope['.write'], false, node + ' must be server-owned');
  }
});

test('Firebase deployment never uses the public Pages bundle as Functions source', () => {
  const config = read('firebase.json');
  const sources = (Array.isArray(config.functions) ? config.functions : [config.functions])
    .map(item => typeof item === 'string' ? item : item?.source);
  assert.ok(sources.includes('functions'), 'Dedicated backend source is required');
  assert.ok(!sources.includes('dist') && !sources.includes('.'),
    'Do not deploy static assets as backend source');
});
