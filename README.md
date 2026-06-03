# Research Workspace — Collab Work

## Project Structure

```
Research_workspace/
├── docker-compose.yml       ← single compose file
├── .env.example             ← copy to .env and fill secrets
├── .gitignore
├── frontend/                ← React + Vite app
│   ├── Dockerfile
│   ├── nginx.conf           ← serves SPA, proxies /api → backend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── app.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── animations/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── store/
└── backend/                 ← Flask API
    ├── Dockerfile
    ├── requirements.txt
    ├── run.py
    ├── app/
    └── tests/
```

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env
# Edit .env with your secrets

# 2. Build and start all services
docker compose up --build

# 3. Open in browser
open http://localhost:3000
```

## Services

| Service  | Internal Port | Exposed Port |
|----------|---------------|--------------|
| frontend | 80            | 3000         |
| backend  | 5000          | internal only|
| db       | 5432          | internal only|

The frontend nginx proxy routes `/api/*` requests to the backend container automatically.

## Development (without Docker)

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python run.py      # → http://localhost:5000
```
