# Project Structure

## Root layout

- `backend/`: FastAPI backend, data, models, static assets, and index-building script.
- `TNHH_GM/`: Original frontend source kept nguyên trạng theo yêu cầu.

## Backend layout

- `backend/app/`: API entrypoint, schemas, config, retrieval, and chat logic.
- `backend/data/`: Product dataset files.
- `backend/models/`: FAISS index and metadata.
- `backend/assets/product-images/`: Product images served by backend.
- `backend/static/`: Static HTML demo page for backend.
- `backend/scripts/`: Maintenance scripts such as index building.
