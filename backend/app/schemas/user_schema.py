# app/schemas/user_schema.py

from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserPublic(BaseModel):
    id: str
    name: str
    email: str

class UserUpdateRequest(BaseModel):
    name: str | None = None
    password: str | None = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool                               # ← add this
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
