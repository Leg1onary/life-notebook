import app.models  # noqa: регистрируем все модели до init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import engine, init_db
from app.models.user import User
from app.routers import auth, emotion_logs, notes, sections, sync, tasks

app = FastAPI(title="Life Notebook API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        existing = session.exec(
            select(User).where(User.username == settings.first_user_username)
        ).first()
        if not existing:
            user = User(
                username=settings.first_user_username,
                hashed_password=hash_password(settings.first_user_password),
            )
            session.add(user)
            session.commit()


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(sections.router, prefix="/api/sections", tags=["sections"])
app.include_router(emotion_logs.router, prefix="/api/emotion-logs", tags=["emotion-logs"])
app.include_router(sync.router, prefix="/api/sync", tags=["sync"])


@app.get("/health")
def health():
    return {"status": "ok"}
