from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.task import Task
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


class TaskIn(BaseModel):
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


@router.get("/", response_model=List[TaskIn])
def list_tasks(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    rows = session.exec(select(Task).where(Task.user_id == current_user.id)).all()
    return rows


@router.put("/{task_id}")
def upsert_task(task_id: str, body: TaskIn, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(Task, task_id)
    if existing:
        for k, v in body.dict().items():
            setattr(existing, k, v)
        existing.user_id = current_user.id
        session.add(existing)
    else:
        task = Task(**body.dict(), user_id=current_user.id)
        session.add(task)
    session.commit()
    return {"ok": True}
