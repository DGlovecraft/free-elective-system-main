from pathlib import Path

import joblib

from app.nlp.preprocess import preprocess_text


# =========================================================
# Model paths
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR
    / "model"
    / "knn_model.pkl"
)

VECTORIZER_PATH = (
    BASE_DIR
    / "model"
    / "tfidf_vectorizer.pkl"
)


# =========================================================
# Load model
# =========================================================

model = joblib.load(
    MODEL_PATH
)

vectorizer = joblib.load(
    VECTORIZER_PATH
)


# =========================================================
# Prediction
# =========================================================

def predict_category(text: str):

    if not text:
        raise ValueError(
            "ข้อความสำหรับทำนายต้องไม่ว่าง"
        )

    text = str(text).strip()

    if not text:
        raise ValueError(
            "ข้อความสำหรับทำนายต้องไม่ว่าง"
        )

    # ---------------------------------------------
    # NLP
    # ---------------------------------------------

    processed_text = (
        preprocess_text(text)
    )

    print()
    print("=" * 60)
    print("PREDICTION")
    print("=" * 60)

    print(
        "Original:",
        text
    )

    print(
        "Processed:",
        processed_text
    )

    # ---------------------------------------------
    # TF-IDF
    # ---------------------------------------------

    vector = (
        vectorizer.transform(
            [processed_text]
        )
    )

    print(
        "TF-IDF shape:",
        vector.shape
    )

    # ---------------------------------------------
    # KNN
    # ---------------------------------------------

    prediction = (
        model.predict(vector)
    )

    category = str(
        prediction[0]
    )

    print(
        "Category:",
        category
    )

    print("=" * 60)

    return category