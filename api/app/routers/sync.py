from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.emotion_log import EmotionLog
from app.models.note import Note
from app.models.section import Section
from app.models.task import Task
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


# ── Схемы ──────────────────────────────────────────────────────────────────

class TaskPayload(BaseModel):
    id: str
    title: str
    is_done: bool = False
    done_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    category: str = "personal"
    position: int = 0
    section_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class NotePayload(BaseModel):
    id: str
    title: str
    body: str = ""
    section_id: Optional[str] = None
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class SectionPayload(BaseModel):
    id: str
    name: str
    icon: str = "📁"
    color: str = "#57a9ad"
    description: Optional[str] = None
    parent_id: Optional[str] = None
    position: int = 0
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class EmotionLogPayload(BaseModel):
    id: str
    emotion: str
    emotion_category: str = "other"
    situation: str
    body_reaction: Optional[str] = None
    thought: Optional[str] = None
    desired_action: Optional[str] = None
    context_tag: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class PushRequest(BaseModel):
    tasks: List[TaskPayload] = []
    notes: List[NotePayload] = []
    sections: List[SectionPayload] = []
    emotion_logs: List[EmotionLogPayload] = []


class PullResponse(BaseModel):
    tasks: List[TaskPayload]
    notes: List[NotePayload]
    sections: List[SectionPayload]
    emotion_logs: List[EmotionLogPayload]
    server_time: str


# ── Хелпер upsert ─────────────────────────────────────────────────────────

def _upsert(session: Session, model_cls, payload_dict: dict, user_id: str):
    existing = session.get(model_cls, payload_dict["id"])
    if existing:
        # Обновляем только если запись на клиенте новее
        if payload_dict["updated_at"] >= existing.updated_at:
            for k, v in payload_dict.items():
                setattr(existing, k, v)
            existing.user_id = user_id
            session.add(existing)
    else:
        obj = model_cls(**payload_dict, user_id=user_id)
        session.add(obj)


# ── Эндпоинты ─────────────────────────────────────────────────────────────

@router.post("/push")
def push(
    body: PushRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Клиент отправляет все несинхронизированные записи на сервер."""
    for item in body.tasks:
        _upsert(session, Task, item.dict(), current_user.id)
    for item in body.notes:
        _upsert(session, Note, item.dict(), current_user.id)
    for item in body.sections:
        _upsert(session, Section, item.dict(), current_user.id)
    for item in body.emotion_logs:
        _upsert(session, EmotionLog, item.dict(), current_user.id)
    session.commit()
    return {"ok": True, "synced_at": datetime.utcnow().isoformat()}


@router.get("/pull", response_model=PullResponse)
def pull(
    since: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Клиент запрашивает все записи (или изменения с момента since)."""
    uid = current_user.id

    def q(model_cls):
        query = select(model_cls).where(model_cls.user_id == uid)
        if since:
            since_dt = datetime.fromisoformat(since)
            query = query.where(model_cls.updated_at >= since_dt)
        return session.exec(query).all()

    return PullResponse(
        tasks=[TaskPayload(**t.__dict__) for t in q(Task)],
        notes=[NotePayload(**n.__dict__) for n in q(Note)],
        sections=[SectionPayload(**s.__dict__) for s in q(Section)],
        emotion_logs=[EmotionLogPayload(**e.__dict__) for e in q(EmotionLog)],
        server_time=datetime.utcnow().isoformat(),
    )
