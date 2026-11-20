# Merchant Review Portal

Angular 21 take-home: merchant applications, roles (SALES / REVIEWER / ADMIN), and an in-memory mock API.

Project definition: [ASSIGNMENT.md](./ASSIGNMENT.md)  
Mock API internals: [mock-api/README.md](./mock-api/README.md)

## Prerequisites

- Node.js 20+ (this repo was generated on Node 20)
- npm
- For Docker: Docker Desktop (or Engine + Compose)

```bash
npm install
```

The Angular App uses mock API at **`http://localhost:3000`** (CORS is enabled).

## Run everything locally

One command starts the mock API and the Angular dev server:

```bash
npm run start:all
```

| Process | URL |
| --- | --- |
| Angular (live reload) | http://localhost:4200 |
| Mock API | http://localhost:3000 |

Open **http://localhost:4200** in the browser.



### Start them separately

```bash
npm run mock-api   # API only  → http://localhost:3000
npm start          # Angular only → http://localhost:4200
```

## Run everything with Docker

Builds both images and starts both containers:

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Angular (production build, Nginx) | http://localhost:8080 |
| Mock API | http://localhost:3000 |

Open **http://localhost:8080**. The browser still calls the API at `http://localhost:3000`.

Stop:

```bash
docker compose down
```

## Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `sales@demo.local` | `Sales@2468` | SALES (Ram) |
| `reviewer@demo.local` | `Reviewer@2468` | REVIEWER (Hari) |
| `admin@demo.local` | `Admin@2468` | ADMIN (Krishna) |

## Other commands

```bash
npm test              # Vitest + TestBed
npm run build         # production output in dist/
npm run storybook     # http://localhost:6006
```
