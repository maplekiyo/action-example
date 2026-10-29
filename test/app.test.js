import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test('GET / returns a greeting', async () => {
  const res = await fetch(baseUrl);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { message: 'Hello from Node.js!' });
});

test('GET /health reports ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('todo CRUD flow', async () => {
  const created = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Write tests' }),
  });
  assert.equal(created.status, 201);
  const todo = await created.json();
  assert.equal(todo.title, 'Write tests');
  assert.equal(todo.done, false);

  const updated = await fetch(`${baseUrl}/todos/${todo.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done: true }),
  });
  assert.equal((await updated.json()).done, true);

  const list = await (await fetch(`${baseUrl}/todos`)).json();
  assert.equal(list.length, 1);

  const deleted = await fetch(`${baseUrl}/todos/${todo.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);

  const missing = await fetch(`${baseUrl}/todos/${todo.id}`);
  assert.equal(missing.status, 404);
});

test('POST /todos rejects a missing title', async () => {
  const res = await fetch(`${baseUrl}/todos`, { method: 'POST', body: '{}' });
  assert.equal(res.status, 400);
});

test('POST /todos rejects invalid JSON', async () => {
  const res = await fetch(`${baseUrl}/todos`, { method: 'POST', body: '{oops' });
  assert.equal(res.status, 400);
});

test('unknown routes return 404', async () => {
  const res = await fetch(`${baseUrl}/nope`);
  assert.equal(res.status, 404);
});
