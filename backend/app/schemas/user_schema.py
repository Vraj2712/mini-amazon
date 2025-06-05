# app/schemas/user_schema.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    # Make is_admin optional with a default of False so serialization never fails:
    is_admin: bool = Field(False, description="Whether this user is an administrator")

    model_config = {
        "from_attributes": True
    }

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
