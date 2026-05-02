from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Section(SQLModel, table=True):
    __tablename__ = "sections"

    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    name: str
    icon: str = "📁"
    color: str = "#57a9ad"
    description: Optional[str] = None
    parent_id: Optional[str] = None
    position: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
