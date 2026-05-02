from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class EmotionLog(SQLModel, table=True):
    __tablename__ = "emotion_logs"

    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    emotion: str
    emotion_category: str = "other"
    situation: str
    body_reaction: Optional[str] = None
    thought: Optional[str] = None
    desired_action: Optional[str] = None
    context_tag: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
