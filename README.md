# action-example

A small Node.js HTTP API with no dependencies (it uses only the built-in `node:http` and `node:test` modules).

## Requirements

- Node.js 20 or later

## Usage

```bash
npm start          # start the server on http://localhost:3000 (set PORT to change it)
npm run dev        # start with auto-restart on file changes
npm test           # run the tests
npm run lint       # check the code for syntax errors
```

## Endpoints

| Method | Path          | Description             |
| ------ | ------------- | ----------------------- |
| GET    | `/`           | Greeting                |
| GET    | `/health`     | Health check            |
| GET    | `/todos`      | List todos              |
| POST   | `/todos`      | Create `{ "title": "" }` |
| GET    | `/todos/:id`  | Get one todo            |
| PATCH  | `/todos/:id`  | Update `title` / `done` |
| DELETE | `/todos/:id`  | Delete a todo           |

Example:

```bash
curl -X POST localhost:3000/todos -H 'Content-Type: application/json' -d '{"title":"Buy milk"}'
```
