import math
import re
import unicodedata
from collections import Counter

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .services.product_catalog_service import list_products

TOKEN_PATTERN = re.compile(r"[a-zA-ZÀ-ỹ0-9]+", re.UNICODE)

CONDITION_GROUPS = {
    "tiểu đường": ("tieu duong", "dai thao duong", "khang insulin"),
    "dạ dày hoặc trào ngược": (
        "da day",
        "trao nguoc",
        "viem loet",
        "dau bao tu",
    ),
    "mang thai hoặc cho con bú": ("mang thai", "cho con bu"),
    "suy giảm miễn dịch": ("suy giam mien dich",),
    "cao huyết áp": ("cao huyet ap", "huyet ap cao"),
    "thuốc chống đông": ("chong dong", "thuoc chong dong"),
    "kiêng caffeine hoặc cồn": ("kieng caffeine", "kieng con", "caffeine", "con"),
    "trẻ nhỏ": ("tre nho",),
}

GOAL_EXPANSIONS = {
    "giam beo": "ít ngọt đường thấp calo thấp lựa chọn cân bằng",
    "giam can": "ít ngọt đường thấp calo thấp lựa chọn cân bằng",
    "tang co": "ít ngọt dinh dưỡng cân bằng",
    "ngu ngon": "caffeine thấp hương dịu thư giãn",
    "mat ngu": "caffeine thấp hương dịu",
    "da dep": "trái cây polyphenol ít ngọt",
    "it duong": "ít ngọt đường thấp",
    "khong caffeine": "caffeine thấp",
}

CANDIDATE_POOL_SIZE = 5
FINAL_RESULT_COUNT = 2


def _fold_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", str(value or "").lower())
    return "".join(character for character in normalized if unicodedata.category(character) != "Mn")


def _tokenize(value: str) -> list[str]:
    return TOKEN_PATTERN.findall(_fold_text(value))


def _normalize_scores(values: np.ndarray) -> np.ndarray:
    if values.size == 0:
        return values
    minimum = float(values.min())
    maximum = float(values.max())
    if math.isclose(minimum, maximum):
        return np.ones_like(values) if maximum > 0 else np.zeros_like(values)
    return (values - minimum) / (maximum - minimum)


def _expand_query(query_text: str) -> str:
    folded_query = _fold_text(query_text)
    expansions = [
        expansion
        for phrase, expansion in GOAL_EXPANSIONS.items()
        if phrase in folded_query
    ]
    return " ".join([query_text, *expansions]).strip()


def _build_product_document(product: dict) -> str:
    return " ".join(
        [
            product["product_name"],
            product["description"],
            product["ingredients"],
            product["nutrition"],
            product["recommended_for"],
            product["product_tags"],
            product["sizes"],
        ]
    )


def _build_rerank_document(product: dict) -> str:
    high_signal_fields = [
        product["product_name"],
        product["product_tags"],
        product["recommended_for"],
        product["nutrition"],
    ]
    return " ".join([*high_signal_fields, *high_signal_fields, product["description"]])


def _bm25_scores(query_tokens: list[str], documents: list[list[str]]) -> np.ndarray:
    if not query_tokens or not documents:
        return np.zeros(len(documents), dtype=float)

    document_frequencies = Counter()
    term_frequencies = []
    document_lengths = []

    for document in documents:
        frequencies = Counter(document)
        term_frequencies.append(frequencies)
        document_lengths.append(len(document))
        document_frequencies.update(frequencies.keys())

    average_length = sum(document_lengths) / max(len(document_lengths), 1)
    k1 = 1.5
    b = 0.75
    scores = np.zeros(len(documents), dtype=float)

    for query_token in set(query_tokens):
        document_frequency = document_frequencies.get(query_token, 0)
        inverse_document_frequency = math.log(
            1 + (len(documents) - document_frequency + 0.5) / (document_frequency + 0.5)
        )

        for index, frequencies in enumerate(term_frequencies):
            frequency = frequencies.get(query_token, 0)
            if frequency == 0:
                continue
            length_normalization = 1 - b + b * document_lengths[index] / max(average_length, 1)
            scores[index] += inverse_document_frequency * (
                frequency * (k1 + 1)
                / (frequency + k1 * length_normalization)
            )

    return scores


def _contraindication_matches(medical_history: str, contraindications: str) -> list[str]:
    history = _fold_text(medical_history)
    warning = _fold_text(contraindications)

    no_known_condition = any(
        phrase in history
        for phrase in (
            "khong co benh nen",
            "khong benh nen",
            "khong co",
            "khong di ung",
            "suc khoe binh thuong",
        )
    )
    if no_known_condition and len(history.split()) <= 8:
        return []

    matches = []
    for label, aliases in CONDITION_GROUPS.items():
        if any(alias in history for alias in aliases) and any(alias in warning for alias in aliases):
            matches.append(label)

    has_denied_allergy = any(
        phrase in history
        for phrase in ("khong di ung", "khong co di ung", "chua tung di ung")
    )
    if "di ung" in history and not has_denied_allergy:
        allergy_terms = [
            token
            for token in _tokenize(history)
            if token not in {"di", "ung", "toi", "bi", "voi", "va", "co"}
        ]
        if any(term in warning for term in allergy_terms):
            matches.append("dị ứng thành phần")

    return list(dict.fromkeys(matches))


def _rerank_candidates(
    candidates: list[dict],
    expanded_query: str,
    top_k: int,
) -> list[dict]:
    if not candidates:
        return []

    rerank_documents = [_build_rerank_document(product) for product in candidates]
    vectorizer = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
    )
    matrix = vectorizer.fit_transform([*rerank_documents, expanded_query])
    field_scores = cosine_similarity(matrix[-1], matrix[:-1]).ravel()

    reranked = []
    for index, product in enumerate(candidates):
        hybrid_score = product["hybrid_score"] / 100
        rerank_score = 0.6 * hybrid_score + 0.4 * float(field_scores[index])
        reranked.append(
            {
                **product,
                "rerank_score": round(rerank_score * 100, 2),
            }
        )

    safe_products = [
        product for product in reranked if not product["contraindication_matches"]
    ]
    risky_products = [
        product for product in reranked if product["contraindication_matches"]
    ]
    ranking_key = lambda product: (
        product["rerank_score"],
        product["hybrid_score"],
    )
    safe_products.sort(key=ranking_key, reverse=True)
    risky_products.sort(key=ranking_key, reverse=True)
    return [*safe_products, *risky_products][:top_k]


class ProductRetriever:
    def search(
        self,
        query_text: str,
        medical_history: str = "",
        candidate_k: int = CANDIDATE_POOL_SIZE,
        top_k: int = FINAL_RESULT_COUNT,
    ) -> list[dict]:
        products = list_products()
        if not products:
            return []

        expanded_query = _expand_query(query_text)
        documents = [_build_product_document(product) for product in products]

        vectorizer = TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            analyzer="char_wb",
            ngram_range=(3, 5),
            min_df=1,
            sublinear_tf=True,
        )
        matrix = vectorizer.fit_transform([*documents, expanded_query])
        vector_scores = cosine_similarity(matrix[-1], matrix[:-1]).ravel()

        tokenized_documents = [_tokenize(document) for document in documents]
        bm25_scores = _bm25_scores(_tokenize(expanded_query), tokenized_documents)
        normalized_bm25 = _normalize_scores(bm25_scores)
        hybrid_scores = 0.55 * vector_scores + 0.45 * normalized_bm25

        ranked_products = []
        for index, product in enumerate(products):
            contraindication_matches = _contraindication_matches(
                medical_history,
                product["contraindications"],
            )

            ranked_products.append(
                {
                    **product,
                    "vector_score": round(float(vector_scores[index]), 4),
                    "bm25_score": round(float(normalized_bm25[index]), 4),
                    "hybrid_score": round(float(hybrid_scores[index]) * 100, 2),
                    "contraindication_matches": contraindication_matches,
                }
            )

        ranked_products.sort(
            key=lambda product: product["hybrid_score"],
            reverse=True,
        )
        candidate_count = max(top_k, candidate_k)
        candidates = ranked_products[:candidate_count]
        return _rerank_candidates(candidates, expanded_query, top_k)
