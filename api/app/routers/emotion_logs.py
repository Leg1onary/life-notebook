from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.emotion_log import EmotionLog
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


class EmotionLogIn(BaseModel):
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


@router.get("/", response_model=List[EmotionLogIn])
def list_emotion_logs(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    rows = session.exec(select(EmotionLog).where(EmotionLog.user_id == current_user.id)).all()
    return rows


@router.put("/{log_id}")
def upsert_emotion_log(log_id: str, body: EmotionLogIn, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(EmotionLog, log_id)
    if existing:
        for k, v in body.dict().items():
            setattr(existing, k, v)
        existing.user_id = current_user.id
        session.add(existing)
    else:
        log = EmotionLog(**body.dict(), user_id=current_user.id)
        session.add(log)
    session.commit()
    return {"ok": True}
