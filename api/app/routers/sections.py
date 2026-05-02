from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.section import Section
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


class SectionIn(BaseModel):
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


@router.get("/", response_model=List[SectionIn])
def list_sections(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    rows = session.exec(select(Section).where(Section.user_id == current_user.id)).all()
    return rows


@router.put("/{section_id}")
def upsert_section(section_id: str, body: SectionIn, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(Section, section_id)
    if existing:
        for k, v in body.dict().items():
            setattr(existing, k, v)
        existing.user_id = current_user.id
        session.add(existing)
    else:
        section = Section(**body.dict(), user_id=current_user.id)
        session.add(section)
    session.commit()
    return {"ok": True}
