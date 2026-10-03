from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests

import os

from app.database.database import get_db
from app.database.models import Student


router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleLoginRequest(BaseModel):
    credential: str


class LinkStudentRequest(BaseModel):
    credential: str
    student_id: str


def verify_google_token(credential: str):
    """
    ตรวจสอบ Google ID Token
    """

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID",
        )

    try:
        user_info = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        issuer = user_info.get("iss")

        if issuer not in [
            "accounts.google.com",
            "https://accounts.google.com",
        ]:
            raise HTTPException(
                status_code=401,
                detail="Google token issuer ไม่ถูกต้อง",
            )

        email = user_info.get("email")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="ไม่พบอีเมลจาก Google",
            )

        return user_info

    except ValueError as e:

        print("======================================")
        print("GOOGLE TOKEN ERROR")
        print(str(e))
        print("======================================")

        raise HTTPException(
            status_code=401,
            detail=f"Google token verification failed: {str(e)}",
        )


# =========================================================
# Google Login
# =========================================================

@router.post("/auth/google")
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    user_info = verify_google_token(
        request.credential
    )

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")

    # -----------------------------------------------------
    # ตรวจว่ามี Google account นี้อยู่แล้วหรือไม่
    # -----------------------------------------------------

    student = (
        db.query(Student)
        .filter(Student.google_id == google_id)
        .first()
    )

    if student:

        print("======================================")
        print("GOOGLE LOGIN - EXISTING STUDENT")
        print("Google ID:", google_id)
        print("Email:", email)
        print("Student ID:", student.student_id)
        print("======================================")

        return {
            "message": "เข้าสู่ระบบด้วย Google สำเร็จ",
            "is_new": False,
            "user": {
                "google_id": google_id,
                "email": email,
                "name": name,
                "picture": picture,
                "student_id": student.student_id,
                "year": student.year,
                "major": student.major,
                "role": "student",
            },
        }

    # -----------------------------------------------------
    # ยังไม่เคยผูก Google กับ student_id
    # -----------------------------------------------------

    print("======================================")
    print("GOOGLE LOGIN - NEW ACCOUNT")
    print("Google ID:", google_id)
    print("Email:", email)
    print("Name:", name)
    print("======================================")

    return {
        "message": "Google Login สำเร็จ แต่ยังไม่ได้ผูกกับรหัสนักศึกษา",
        "is_new": True,
        "user": {
            "google_id": google_id,
            "email": email,
            "name": name,
            "picture": picture,
            "student_id": None,
            "year": None,
            "major": None,
            "role": "student",
        },
    }


# =========================================================
# Link Google Account -> Student ID
# =========================================================

@router.post("/auth/google/link-student")
def link_google_student(
    request: LinkStudentRequest,
    db: Session = Depends(get_db),
):
    user_info = verify_google_token(
        request.credential
    )

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")

    student_id = request.student_id.strip()

    # -----------------------------------------------------
    # ตรวจรูปแบบรหัสนักศึกษา
    # -----------------------------------------------------

    if not student_id.isdigit():
        raise HTTPException(
            status_code=400,
            detail="รหัสนักศึกษาต้องเป็นตัวเลข",
        )

    # Demo account
    demo_ids = {
        "65000001": (1, "วิทยาการคอมพิวเตอร์และสารสนเทศ"),
        "65000002": (2, "วิทยาการคอมพิวเตอร์และสารสนเทศ"),
        "65000003": (3, "วิทยาการคอมพิวเตอร์และสารสนเทศ"),
        "65000004": (4, "วิทยาการคอมพิวเตอร์และสารสนเทศ"),
    }

    # รหัสจริง
    if len(student_id) == 10:

        if not student_id.startswith(
            ("66", "67", "68", "69")
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "กรอกรหัสนักศึกษาผิด "
                    "กรุณากรอกรหัสที่ขึ้นต้นด้วย "
                    "66, 67, 68 หรือ 69"
                ),
            )

        # ยังไม่มีข้อมูลชั้นปีจากระบบจริง
        # กำหนดให้ผู้ใช้เลือกภายหลัง
        year = 1

    elif student_id in demo_ids:

        year, major = demo_ids[student_id]

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                "กรอกรหัสนักศึกษาผิด "
                "กรุณากรอกรหัสที่ขึ้นต้นด้วย "
                "66, 67, 68 หรือ 69"
            ),
        )

    if student_id not in demo_ids:
        major = "วิทยาการคอมพิวเตอร์และสารสนเทศ"

    # -----------------------------------------------------
    # ตรวจว่า student_id นี้ถูกผูกกับ Google account อื่นหรือยัง
    # -----------------------------------------------------

    existing_student = (
        db.query(Student)
        .filter(Student.student_id == student_id)
        .first()
    )

    if existing_student:

        if (
            existing_student.google_id
            and existing_student.google_id != google_id
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "รหัสนักศึกษานี้ถูกผูกกับ "
                    "Google Account อื่นแล้ว"
                ),
            )

        # กรณีมีข้อมูลอยู่แล้ว แต่ยังไม่มี Google ID
        existing_student.google_id = google_id
        existing_student.email = email
        existing_student.name = name

        db.commit()
        db.refresh(existing_student)

        student = existing_student

    else:

        # -------------------------------------------------
        # สร้าง Student ใหม่
        # -------------------------------------------------

        student = Student(
            google_id=google_id,
            email=email,
            name=name,
            student_id=student_id,
            year=year,
            major=major,
        )

        db.add(student)
        db.commit()
        db.refresh(student)

    print("======================================")
    print("GOOGLE ACCOUNT LINKED")
    print("Google ID:", google_id)
    print("Email:", email)
    print("Student ID:", student.student_id)
    print("Year:", student.year)
    print("Major:", student.major)
    print("======================================")

    return {
        "message": "ผูก Google Account กับรหัสนักศึกษาเรียบร้อยแล้ว",
        "user": {
            "google_id": student.google_id,
            "email": student.email,
            "name": student.name,
            "student_id": student.student_id,
            "year": student.year,
            "major": student.major,
            "role": "student",
        },
    }