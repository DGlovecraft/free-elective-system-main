import os

# Vercel ใช้ filesystem แบบ read-only ใน /home
# ให้ PyThaiNLP ใช้พื้นที่ /tmp แทน
os.environ["PYTHAINLP_DATA"] = "/tmp/pythainlp-data"

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.suggestions import router as suggestions_router
from app.api.dashboard import router as dashboard_router
from app.api.auth import router as auth_router

from app.database.database import Base, engine
from app.database import models


# สร้างตาราง Database
Base.metadata.create_all(bind=engine)


# สร้าง FastAPI Application
app = FastAPI(
    title="Free Elective System API",
    description="API สำหรับระบบเสนอและวิเคราะห์ความต้องการรายวิชาเสรีของนักศึกษา",
    version="1.0.0",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://frontend-ivory-zeta-42.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root
@app.get("/")
def root():
    return {
        "message": "Free Elective System API is running"
    }


# Health Check
@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# Suggestions API
app.include_router(
    suggestions_router,
    prefix="/api"
)


# Dashboard API
app.include_router(
    dashboard_router,
    prefix="/api"
)


# Authentication API
app.include_router(
    auth_router,
    prefix="/api"
)