# app/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from bson import ObjectId
from datetime import datetime

from app.auth.dependencies import require_admin
from app.database import db
from app.models.user_model import user_helper
from app.schemas.user_schema import UserPublic
from app.models.product_model import product_helper
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)]
)

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

# ── User Management ──────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserPublic])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * limit
    cursor = db.users.find().skip(skip).limit(limit)
    out = []
    async for u in cursor:
        out.append(user_helper(u))
    return out

@router.put("/users/{user_id}/role", response_model=UserPublic)
async def change_user_role(user_id: str, is_admin: bool):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.update_one(
        {"_id": oid},
        {"$set": {"is_admin": is_admin}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await db.users.find_one({"_id": oid})
    return user_helper(updated)


# ── Product Management ───────────────────────────────────────────────────────────

@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * limit
    cursor = db.products.find().skip(skip).limit(limit)
    out = []
    async for p in cursor:
        out.append(product_helper(p))
    return out

@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate):
    d = product.model_dump()
    d["created_at"] = datetime.utcnow()
    res = await db.products.insert_one(d)
    new = await db.products.find_one({"_id": res.inserted_id})
    return product_helper(new)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, upd: ProductUpdate):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    data = {k: v for k, v in upd.model_dump().items() if v is not None}
    result = await db.products.update_one({"_id": oid}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await db.products.find_one({"_id": oid})
    return product_helper(updated)

@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: str):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return
