from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Note(SQLModel, table=True):
    __tablename__ = "notes"

    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    title: str
    body: str = ""
    section_id: Optional[str] = None
    is_pinned: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
