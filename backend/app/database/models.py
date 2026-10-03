from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    # Google account
    google_id = Column(String, unique=True, nullable=True, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)

    # ข้อมูลนักศึกษา
    student_id = Column(String, unique=True, nullable=False, index=True)
    year = Column(Integer, nullable=False)
    major = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    suggestions = relationship(
        "CourseSuggestion",
        back_populates="student",
    )


class CourseSuggestion(Base):
    __tablename__ = "course_suggestions"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        String,
        ForeignKey("students.student_id"),
        nullable=False,
        index=True,
    )

    course_name = Column(
        String,
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=False,
    )

    category = Column(
        String,
        nullable=False,
    )

    year = Column(
        Integer,
        nullable=False,
    )

    major = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    student = relationship(
        "Student",
        back_populates="suggestions",
    )