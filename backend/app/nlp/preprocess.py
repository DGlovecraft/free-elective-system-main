import os

# Vercel ใช้ filesystem แบบ read-only ใน /home
# ให้ PyThaiNLP ใช้พื้นที่ /tmp แทน
os.environ["PYTHAINLP_DATA"] = "/tmp/pythainlp-data"

from pythainlp.tokenize import word_tokenize


def preprocess_text(text: str) -> str:
    """
    เตรียมข้อความภาษาไทยสำหรับนำไปทำ Machine Learning
    """

    # แปลงเป็น string และตัดช่องว่างหัวท้าย
    text = str(text).strip()

    # ตัดคำภาษาไทย
    tokens = word_tokenize(
        text,
        engine="newmm"
    )

    # เอาคำที่ไม่ใช่ช่องว่างออก
    tokens = [
        token.strip()
        for token in tokens
        if token.strip()
    ]

    # รวมคำกลับเป็นข้อความ
    return " ".join(tokens)