from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import ConfigDict
def user_helper(user: dict) -> dict:
    """
    Transform a raw MongoDB `user` document into exactly the fields that
    our UserResponse schema expects.
    """
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "created_at": user.get("created_at", datetime.utcnow()),
        # ALWAYS include is_admin; if the document didn’t have it, default to False.
        "is_admin": user.get("is_admin", False),
    }
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)

    
    