import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parents[2]

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+psycopg://",
        1,
    )
elif DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1,
    )

if os.getenv("VERCEL") == "1":
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL must be configured on Vercel; "
            "SQLite is not persistent in serverless functions."
        )
    if not DATABASE_URL.startswith("postgresql+psycopg://"):
        raise RuntimeError(
            "Vercel DATABASE_URL must use a PostgreSQL connection URL."
        )

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )
elif DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args=(
            {"check_same_thread": False}
            if DATABASE_URL.startswith("sqlite:")
            else {}
        ),
        pool_pre_ping=not DATABASE_URL.startswith("sqlite:"),
    )
else:
    DATABASE_PATH = BASE_DIR / "data" / "free_elective.db"
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()