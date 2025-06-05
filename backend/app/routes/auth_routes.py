# app/routes/auth_routes.py

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user_schema import UserCreate, UserPublic, UserUpdateRequest, UserResponse
from app.auth.utils import hash_password, verify_password, create_access_token
from app.database import db
from app.models.user_model import user_helper
from app.auth.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserPublic)
async def signup(user: UserCreate):
    # 1) Reject duplicate email
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2) Hash password and build the document
    user_dict = user.model_dump()  # { name, email, password }
    hashed = hash_password(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_admin"] = False        # <--- always default to False

    # 3) Insert into MongoDB & return helper’ed result
    result = await db.users.insert_one(user_dict)
    created = await db.users.find_one({"_id": result.inserted_id})
    return user_helper(created)


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/user", response_model=UserResponse)
async def get_current_user_route(current_user=Depends(get_current_user)):
    """
    Fetch the full user document from MongoDB (so that the `is_admin` field is guaranteed),
    then return it through user_helper(...).
    """
    # Re‐query MongoDB by email (or by _id). current_user.email was extracted by get_current_user.
    from app.models.user_model import user_helper

    user_in_db = await db.users.find_one({"email": current_user.email})
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    return user_helper(user_in_db)


@router.put("/user", response_model=UserResponse)
async def update_current_user_info(
    update: UserUpdateRequest,
    current_user=Depends(get_current_user)
):
    """
    Let the logged‐in user change name and/or password.
    Response must include is_admin as well.
    """
    update_data = {}
    if update.name is not None:
        update_data["name"] = update.name

    if update.password:
        update_data["hashed_password"] = hash_password(update.password)

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )

    updated = await db.users.find_one({"_id": ObjectId(current_user.id)})
    return user_helper(updated)
