from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    title: str
    is_done: bool = False
    done_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    category: str = "personal"
    position: int = 0
    section_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
