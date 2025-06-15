# app/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from app.models.order_model import order_helper
import os, shutil

from app.auth.dependencies import require_admin
from app.database import db
from app.models.user_model import user_helper
from app.schemas.user_schema import UserResponse
from app.models.product_model import product_helper
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)]
)

# ──────────────────────────────── UPLOAD IMAGE ────────────────────────────────
UPLOAD_DIR = "uploads/products"

@router.post("/products/upload-image")
async def admin_upload_image(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"/uploads/products/{file.filename}"
        return {"url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ──────────────────────────────── ADMIN DASHBOARD STATS ────────────────────────────────
@router.get("/stats")
async def get_admin_stats():
    total_users    = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders   = await db.orders.count_documents({})

    statuses = ["pending", "shipped", "delivered", "cancelled"]
    orders_by_status = {}
    for s in statuses:
        orders_by_status[s] = await db.orders.count_documents({"status": s})

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "orders_by_status": orders_by_status,
    }

# ──────────────────────────────── USER MANAGEMENT ────────────────────────────────
class RoleUpdate(BaseModel):
    is_admin: bool

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    q: Optional[str] = Query(None, description="Filter by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    skip = (page - 1) * limit
    query: dict = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]

    cursor = db.users.find(query).skip(skip).limit(limit)
    out = [user_helper(u) async for u in cursor]
    return out

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def change_user_role(user_id: str, update: RoleUpdate):
    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.update_one({"_id": oid}, {"$set": {"is_admin": update.is_admin}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await db.users.find_one({"_id": oid})
    return user_helper(updated)

# ──────────────────────────────── PRODUCT MANAGEMENT ────────────────────────────────
@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    q: Optional[str] = Query(None, description="Filter by product name"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    skip = (page - 1) * limit
    query: dict = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}

    cursor = db.products.find(query).skip(skip).limit(limit)
    out = [product_helper(p) async for p in cursor]
    return out

@router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    data = product.model_dump()
    data["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(data)
    new = await db.products.find_one({"_id": result.inserted_id})
    return product_helper(new)

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: str):
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    prod = await db.products.find_one({"_id": oid})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product_helper(prod)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, upd: ProductUpdate):
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    data = {k: v for k, v in upd.model_dump().items() if v is not None}
    result = await db.products.update_one({"_id": oid}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await db.products.find_one({"_id": oid})
    return product_helper(updated)

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return

# ──────────────────────────────── ORDER MANAGEMENT ────────────────────────────────
@router.get("/orders", response_model=List[dict])
async def get_orders_by_status(
    status: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    admin_user=Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    if email:
        query["user_email"] = email
    if start and end:
        query["created_at"] = {"$gte": start, "$lte": end}

    cursor = db.orders.find(query).skip((page - 1) * limit).limit(limit)
    orders = [order_helper(order) async for order in cursor]
    return orders
