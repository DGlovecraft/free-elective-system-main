from pathlib import Path

import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

from app.nlp.preprocess import preprocess_text


# =========================
# 1. Dataset
# =========================

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "training_data.csv"

df = pd.read_csv(DATA_PATH)

print("จำนวนข้อมูลทั้งหมด:", len(df))


# =========================
# 2. NLP
# =========================

df["processed_text"] = df["text"].apply(preprocess_text)


# =========================
# 3. TF-IDF
# =========================

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2)
)

X = vectorizer.fit_transform(df["processed_text"])
y = df["category"]


print("จำนวน Features:", len(vectorizer.get_feature_names_out()))
print("ขนาด Feature Matrix:", X.shape)


# =========================
# 4. Train / Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nข้อมูลสำหรับ Train:", X_train.shape[0])
print("ข้อมูลสำหรับ Test:", X_test.shape[0])


# =========================
# 5. KNN
# =========================

model = KNeighborsClassifier(
    n_neighbors=5
)

model.fit(X_train, y_train)


# =========================
# 6. Prediction
# =========================

y_pred = model.predict(X_test)


# =========================
# 7. Evaluation
# =========================

accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))
# =========================
# 8. Save Model
# =========================

MODEL_DIR = BASE_DIR / "app" / "ml" / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

import joblib

joblib.dump(model, MODEL_DIR / "knn_model.pkl")
joblib.dump(vectorizer, MODEL_DIR / "tfidf_vectorizer.pkl")

print("\nบันทึก Model เรียบร้อยแล้ว")
print("Model:", MODEL_DIR / "knn_model.pkl")
print("Vectorizer:", MODEL_DIR / "tfidf_vectorizer.pkl")