from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.note import Note
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


class NoteIn(BaseModel):
    id: str
    title: str
    body: str = ""
    section_id: Optional[str] = None
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@router.get("/", response_model=List[NoteIn])
def list_notes(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    rows = session.exec(select(Note).where(Note.user_id == current_user.id)).all()
    return rows


@router.put("/{note_id}")
def upsert_note(note_id: str, body: NoteIn, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(Note, note_id)
    if existing:
        for k, v in body.dict().items():
            setattr(existing, k, v)
        existing.user_id = current_user.id
        session.add(existing)
    else:
        note = Note(**body.dict(), user_id=current_user.id)
        session.add(note)
    session.commit()
    return {"ok": True}
