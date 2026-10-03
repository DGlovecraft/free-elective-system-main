from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import CourseSuggestion

router = APIRouter()


# ==========================================
# สรุปจำนวนข้อเสนอตามหมวดหมู่
# ==========================================

@router.get("/dashboard/categories")
def get_category_summary(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            CourseSuggestion.category,
            func.count(CourseSuggestion.id).label("count")
        )
        .group_by(CourseSuggestion.category)
        .order_by(
            func.count(CourseSuggestion.id).desc()
        )
        .all()
    )

    return [
        {
            "category": category,
            "count": count
        }
        for category, count in results
    ]


# ==========================================
# สรุปจำนวนข้อตามชั้นปี
# ==========================================

@router.get("/dashboard/years")
def get_year_summary(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            CourseSuggestion.year,
            func.count(CourseSuggestion.id).label("count")
        )
        .group_by(CourseSuggestion.year)
        .order_by(CourseSuggestion.year)
        .all()
    )

    return [
        {
            "year": year,
            "count": count
        }
        for year, count in results
    ]


# ==========================================
# สรุปหมวดหมู่แยกตามชั้นปี
# ==========================================

@router.get("/dashboard/category-years")
def get_category_year_summary(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            CourseSuggestion.category,
            CourseSuggestion.year,
            func.count(CourseSuggestion.id).label("count")
        )
        .group_by(
            CourseSuggestion.category,
            CourseSuggestion.year
        )
        .order_by(
            CourseSuggestion.year,
            CourseSuggestion.category
        )
        .all()
    )

    return [
        {
            "category": category,
            "year": year,
            "count": count
        }
        for category, year, count in results
    ]