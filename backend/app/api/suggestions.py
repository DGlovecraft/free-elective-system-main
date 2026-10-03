from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import CourseSuggestion
from app.ml.predict import predict_category


router = APIRouter()


# =========================================================
# PREDICTION
# =========================================================

class PredictionRequest(BaseModel):

    text: str


@router.post("/predict")
def predict(
    request: PredictionRequest
):

    category = predict_category(
        request.text
    )

    return {
        "category": category
    }


# =========================================================
# CREATE SUGGESTION
# =========================================================

class SuggestionRequest(BaseModel):

    student_id: str

    course_name: str

    reason: str

    category: str

    year: int

    major: str


@router.post("/suggestions")
def create_suggestion(
    request: SuggestionRequest,
    db: Session = Depends(get_db)
):

    suggestion = CourseSuggestion(

        student_id=request.student_id,

        course_name=request.course_name,

        reason=request.reason,

        category=request.category,

        year=request.year,

        major=request.major,

    )


    db.add(
        suggestion
    )

    db.commit()

    db.refresh(
        suggestion
    )


    return {

        "message":
            "บันทึกข้อเสนอเรียบร้อยแล้ว",

        "id":
            suggestion.id,

        "category":
            suggestion.category,

    }


# =========================================================
# GET ALL SUGGESTIONS
# =========================================================

@router.get("/suggestions")
def get_suggestions(
    db: Session = Depends(get_db)
):

    suggestions = (

        db.query(
            CourseSuggestion
        )

        .order_by(
            CourseSuggestion.created_at.desc()
        )

        .all()

    )


    return [

        {

            "id":
                suggestion.id,

            "student_id":
                suggestion.student_id,

            "course_name":
                suggestion.course_name,

            "reason":
                suggestion.reason,

            "category":
                suggestion.category,

            "year":
                suggestion.year,

            "major":
                suggestion.major,

            "created_at":
                suggestion.created_at,

        }

        for suggestion
        in suggestions

    ]