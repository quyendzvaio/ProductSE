import os
import pickle
from pathlib import Path

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
MODELS_DIR = ROOT_DIR / "models"


def build_product_index(
    csv_path=DATA_DIR / "kombucha_products.csv",
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    output_dir=MODELS_DIR,
):
    # Äá»c dá»¯ liá»‡u
    df = pd.read_csv(csv_path)

    # Xá»­ lÃ½ cÃ¡c cá»™t vÄƒn báº£n: thay NaN báº±ng chuá»—i rá»—ng vÃ  Ã©p kiá»ƒu string
    text_columns = ["TÃªn", "ThÃ nh pháº§n", "MÃ´ táº£", "HÆ°Æ¡ng vá»‹"]
    for col in text_columns:
        df[col] = df[col].fillna("").astype(str)

    # Táº¡o vÄƒn báº£n Ä‘á»ƒ embedding
    df["text_for_embedding"] = (
        df["TÃªn"] + " " +
        df["ThÃ nh pháº§n"] + " " +
        df["MÃ´ táº£"] + " " +
        df["HÆ°Æ¡ng vá»‹"]
    )
    texts = df["text_for_embedding"].tolist()

    # Load model
    print("Loading model...")
    model = SentenceTransformer(model_name)
    print("Encoding products...")
    embeddings = model.encode(texts, show_progress_bar=True)

    # Chuáº©n hÃ³a vector Ä‘á»ƒ dÃ¹ng inner product = cosine similarity
    embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    dimension = embeddings.shape[1]

    # Táº¡o FAISS index
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings.astype(np.float32))

    # LÆ°u index vÃ  metadata
    os.makedirs(output_dir, exist_ok=True)
    faiss.write_index(index, str(Path(output_dir) / "product_index.faiss"))
    with open(Path(output_dir) / "product_metadata.pkl", "wb") as f:
        pickle.dump(df, f)

    print(f"Done! Indexed {len(df)} products.")


if __name__ == "__main__":
    build_product_index()
