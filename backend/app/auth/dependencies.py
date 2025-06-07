# app/auth/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime
from app.auth.utils import SECRET_KEY, ALGORITHM
from app.database import db
from app.schemas.user_schema import UserResponse  # now includes is_admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise credentials_exception

    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        is_admin=user_doc.get("is_admin", False),    # ← read it here
        created_at=user_doc["created_at"],
    )

async def require_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user
