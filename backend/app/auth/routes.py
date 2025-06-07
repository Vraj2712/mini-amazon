# backend/app/auth/routes.py

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from bson import ObjectId

from app.schemas.user_schema import (
    UserCreate,
    UserPublic,
    UserResponse,
    UserUpdateRequest,
)
from app.auth.utils import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.database import db
from app.models.user_model import user_helper

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/user", response_model=UserResponse)
async def get_current_user_route(current_user=Depends(get_current_user)):
    """
    Return the currently authenticated user's details.
    """
    return current_user


@router.post("/signup", response_model=UserPublic)
async def signup(user: UserCreate):
    """
    Create a new user. If the email already exists, return 400.
    """
    # 1) Check for existing email
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2) Hash password + insert
    user_dict = user.model_dump()
    hashed = hash_password(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_admin"] = False  # default to non-admin

    result = await db.users.insert_one(user_dict)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    return user_helper(new_user)


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate with email/password (form‐encoded). Return a Bearer token.
    """
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.put("/user", response_model=UserResponse)
async def update_current_user_info(
    update: UserUpdateRequest,
    current_user=Depends(get_current_user)
):
    """
    Allow a logged‐in user to update their name and/or password.
    """
    update_data = {}

    if update.name is not None:
        update_data["name"] = update.name

    if update.password:
        update_data["hashed_password"] = hash_password(update.password)

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    # 3) Perform MongoDB update
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )

    # 4) Fetch fresh document and run it through user_helper(...)
    updated = await db.users.find_one({"_id": ObjectId(current_user.id)})
    return user_helper(updated)
