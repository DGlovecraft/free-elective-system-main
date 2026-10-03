from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "training_data.csv"

df = pd.read_csv(DATA_PATH)

print("จำนวนข้อมูล:", len(df))
print("คอลัมน์:", list(df.columns))

print("\nข้อมูลว่าง:")
print(df.isnull().sum())

print("\nจำนวนแต่ละหมวดหมู่:")
print(df["category"].value_counts())

print("\nตัวอย่างข้อมูล:")
print(df.head())