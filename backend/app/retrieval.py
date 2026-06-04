import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from .config import MODELS_DIR

class ProductRetriever:
    def __init__(self,
                 index_path=MODELS_DIR / "product_index.faiss",
                 metadata_path=MODELS_DIR / "product_metadata.pkl",
                 model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.index = faiss.read_index(str(index_path))
        with open(metadata_path, "rb") as f:
            self.df = pickle.load(f)
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Retriever using device: {device}")
        self.model = SentenceTransformer(model_name, device=device)
    
    def search(self, query_text, threshold=0.6, top_k=5):
        # Tạo embedding cho câu hỏi
        query_emb = self.model.encode([query_text], convert_to_numpy=True)[0]
        query_emb = query_emb / np.linalg.norm(query_emb)   # chuẩn hóa
        query_emb = query_emb.astype(np.float32).reshape(1, -1)
        
        # Tìm kiếm
        scores, indices = self.index.search(query_emb, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            if score >= threshold:
                product = self.df.iloc[idx]
                results.append({
                    'Tên': product['Tên'],
                    'Hương vị': product['Hương vị'],
                    'Mô tả': product['Mô tả'],
                    'Link ảnh sản phẩm': product['Link ảnh sản phẩm'],
                    'Thành phần': product['Thành phần'],
                    'Chống chỉ định với': product['Chống chỉ định với'],
                    'Độ tương đồng': round(score * 100, 2)
                })
        return results
