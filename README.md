# Project Structure

## Root layout

- `backend/`: FastAPI API, chatbot, product retrieval, and warehouse services.
- `frontend/frontend/`: React and Vite frontend.
- `data/`: PostgreSQL product catalog seed data.

## Backend layout

- `backend/app/`: API entrypoint, schemas, config, retrieval, and chat logic.
- `backend/data/`: Product dataset files.
- `backend/models/`: Warehouse forecasting model and legacy retrieval artifacts.
- `backend/assets/product-images/`: Product images served by backend.
- `backend/static/`: Static HTML demo page for backend.
- `backend/scripts/`: Maintenance scripts such as index building.

## Run locally

### 1. PostgreSQL

```bash
docker compose up -d postgres
```

The local database uses:

```text
postgresql://productse:productse@localhost:5432/productse
```

Import or refresh the product catalog manually:

```bash
.venv/bin/python -m backend.scripts.import_product_catalog
```

The backend also creates the table and upserts
`backend/data/kombucha_product_catalog.csv` automatically on startup. The
top-level `data/kombucha_product_catalog.csv` remains the editable source copy.

### 2. Backend

```bash
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python -m uvicorn backend.app.main:app --reload --port 8000
```

Product APIs:

```text
GET /api/products
GET /api/products/{product_code}
```

### 3. Frontend

```bash
cd frontend/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Clicking a product requests its details from
PostgreSQL through the backend API.

## Tests

Start PostgreSQL before running the backend suite:

```bash
docker compose up -d postgres
.venv/bin/python -m pip install -r backend/requirements-dev.txt
.venv/bin/python -m pytest \
  --cov=backend.app \
  --cov-report=term-missing
```

Run frontend tests, lint, dependency audit, and production build:

```bash
cd frontend/frontend
npm ci
npm run test:coverage
npm run lint
npm audit --omit=dev
npm run build
```

Backend tests cover the PostgreSQL catalog/API, hybrid top-5 retrieval,
top-2 reranking, contraindication handling, the five-question consultation
flow, session reset, and medical-claim filtering. Frontend tests cover chatbot
session initialization, clickable recommendation links, and product deep links.

## CI/CD

The workflow at `.github/workflows/ci-cd.yml` runs on pull requests and pushes
to `main`:

1. Start PostgreSQL 16 and run backend tests with coverage.
2. Run frontend lint, Vitest coverage, production dependency audit, and build.
3. Upload coverage reports and the frontend `dist` artifact.
4. Deploy the complete Vercel project after both test jobs pass.

Production deployment is disabled until the repository variable
`VERCEL_DEPLOY_ENABLED` is set to `true`. Add these GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The Vercel project also needs a production `DATABASE_URL` pointing to a hosted
PostgreSQL database. Do not use the Docker Compose localhost URL in production.
The frontend automatically calls `/backend` on the deployed domain and port
`8000` during local development.
