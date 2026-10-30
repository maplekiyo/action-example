import { createServer } from 'node:http';

// In-memory store; resets whenever the server restarts.
export function createApp() {
  const todos = new Map();
  let nextId = 1;

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const match = url.pathname.match(/^\/todos\/(\d+)$/);

    try {
      if (req.method === 'GET' && url.pathname === '/') {
        return send(res, 200, { message: 'Hello from Node.js!!!!!!!!!!' });
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, { status: 'ok', uptime: process.uptime() });
      }

      if (req.method === 'GET' && url.pathname === '/todos') {
        return send(res, 200, [...todos.values()]);
      }

      if (req.method === 'POST' && url.pathname === '/todos') {
        const body = await readJson(req);
        if (typeof body.title !== 'string' || body.title.trim() === '') {
          return send(res, 400, { error: '"title" is required' });
        }
        const todo = { id: nextId++, title: body.title.trim(), done: false };
        todos.set(todo.id, todo);
        return send(res, 201, todo);
      }

      if (match) {
        const id = Number(match[1]);
        const todo = todos.get(id);
        if (!todo) return send(res, 404, { error: 'Todo not found' });

        if (req.method === 'GET') return send(res, 200, todo);

        if (req.method === 'PATCH') {
          const body = await readJson(req);
          if (body.title !== undefined) todo.title = String(body.title);
          if (body.done !== undefined) todo.done = Boolean(body.done);
          return send(res, 200, todo);
        }

        if (req.method === 'DELETE') {
          todos.delete(id);
          res.writeHead(204).end();
          return;
        }
      }

      send(res, 404, { error: 'Not found' });
    } catch (err) {
      if (err instanceof SyntaxError) {
        return send(res, 400, { error: 'Invalid JSON body' });
      }
      console.error(err);
      send(res, 500, { error: 'Internal server error' });
    }
  });
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
