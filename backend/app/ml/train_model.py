from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier

from app.nlp.preprocess import preprocess_text


print("=" * 60)
print("เริ่ม Training Model")
print("=" * 60)


# ============================================================
# 1. กำหนด Path
# ============================================================

# ไฟล์นี้อยู่ที่:
# backend/app/ml/train_model.py
#
# parents[0] = backend/app/ml
# parents[1] = backend/app
# parents[2] = backend

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Training CSV
DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "training_data_backend_thai_v2.csv"
)

# Folder สำหรับเก็บ Model
MODEL_DIR = (
    PROJECT_ROOT
    / "app"
    / "ml"
    / "model"
)

MODEL_PATH = MODEL_DIR / "knn_model.pkl"

VECTORIZER_PATH = (
    MODEL_DIR
    / "tfidf_vectorizer.pkl"
)


print(f"Training data: {DATA_PATH}")
print(f"Model directory: {MODEL_DIR}")


# ============================================================
# 2. ตรวจสอบไฟล์ CSV
# ============================================================

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"\nไม่พบไฟล์ CSV:\n"
        f"{DATA_PATH}\n\n"
        f"กรุณาตรวจสอบว่าไฟล์อยู่ที่:\n"
        f"{PROJECT_ROOT / 'data'}"
    )


# ============================================================
# 3. อ่าน CSV
# ============================================================

print()
print("กำลังอ่าน Training Data...")

df = pd.read_csv(
    DATA_PATH,
    encoding="utf-8-sig"
)

print(
    f"จำนวนข้อมูลทั้งหมด: "
    f"{len(df)} rows"
)


# ============================================================
# 4. ตรวจสอบ Column
# ============================================================

required_columns = [
    "text",
    "category"
]

for column in required_columns:

    if column not in df.columns:

        raise ValueError(
            f"\nไม่พบ column '{column}' ใน CSV\n"
            f"Column ที่พบ: {list(df.columns)}"
        )


# ============================================================
# 5. ทำความสะอาดข้อมูล
# ============================================================

print()
print("กำลังทำความสะอาดข้อมูล...")

df = df.dropna(
    subset=[
        "text",
        "category"
    ]
).copy()


df["text"] = (
    df["text"]
    .astype(str)
    .str.strip()
)


df["category"] = (
    df["category"]
    .astype(str)
    .str.strip()
)


# ตัดข้อมูลที่ไม่มีข้อความ
# หรือไม่มี category

df = df[
    (df["text"] != "") &
    (df["category"] != "")
].copy()


print(
    f"จำนวนข้อมูลหลังทำความสะอาด: "
    f"{len(df)} rows"
)


# ============================================================
# 6. NLP Preprocessing
# ============================================================

print()
print("กำลังทำ NLP Preprocessing...")


df["processed_text"] = (
    df["text"]
    .apply(preprocess_text)
)


# ============================================================
# 7. แสดงจำนวนข้อมูลแต่ละหมวดหมู่
# ============================================================

print()
print("จำนวนข้อมูลแต่ละหมวดหมู่")
print("-" * 60)


category_counts = (
    df["category"]
    .value_counts()
    .sort_index()
)


for category, count in category_counts.items():

    print(
        f"{category}: {count}"
    )


# ============================================================
# 8. TF-IDF
# ============================================================

print()
print("กำลังสร้าง TF-IDF Vectorizer...")


vectorizer = TfidfVectorizer(

    # ใช้คำที่ผ่าน NLP tokenizer แล้ว
    analyzer="word",

    # ใช้ 1-gram, 2-gram และ 3-gram
    #
    # เช่น
    # ระบบ
    # หลังบ้าน
    # ระบบ หลังบ้าน
    # ทำ ระบบ หลังบ้าน
    #
    ngram_range=(1, 3),

    # อนุญาตให้คำที่พบเพียงครั้งเดียว
    # สามารถนำมาใช้เป็น Feature ได้
    min_df=1,

    # ลดผลกระทบของคำที่พบซ้ำ
    sublinear_tf=True,

    # จำกัดจำนวน feature สูงสุด
    max_features=10000
)


X = vectorizer.fit_transform(
    df["processed_text"]
)


y = df["category"]


print(
    f"จำนวน Feature: "
    f"{len(vectorizer.get_feature_names_out())}"
)


print(
    f"TF-IDF Shape: "
    f"{X.shape}"
)


# ============================================================
# 9. KNN
# ============================================================

print()
print("กำลัง Training KNN Model...")


model = KNeighborsClassifier(

    # จำนวนเพื่อนบ้าน
    n_neighbors=5,

    # ให้น้ำหนักเพื่อนบ้านที่อยู่ใกล้กว่า
    weights="distance",

    # ใช้ Cosine Distance
    # เหมาะกับ TF-IDF
    metric="cosine"
)


model.fit(
    X,
    y
)


# ============================================================
# 10. สร้าง Folder Model
# ============================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 11. บันทึก KNN Model
# ============================================================

joblib.dump(
    model,
    MODEL_PATH
)


# ============================================================
# 12. บันทึก TF-IDF Vectorizer
# ============================================================

joblib.dump(
    vectorizer,
    VECTORIZER_PATH
)


# ============================================================
# 13. สรุปผล
# ============================================================

print()
print("=" * 60)
print("Training เสร็จเรียบร้อย")
print("=" * 60)


print()
print("Training Data:")
print(
    f"  {DATA_PATH}"
)


print()
print("KNN Model:")
print(
    f"  {MODEL_PATH}"
)


print()
print("TF-IDF Vectorizer:")
print(
    f"  {VECTORIZER_PATH}"
)


print()
print("จำนวนข้อมูล:")
print(
    f"  {len(df)} rows"
)


print()
print("จำนวนหมวดหมู่:")
print(
    f"  {df['category'].nunique()} categories"
)


print()
print("=" * 60)