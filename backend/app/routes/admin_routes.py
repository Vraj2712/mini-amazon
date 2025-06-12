# app/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from app.models.order_model import order_helper

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


# ── STATS ───────────────────────────────────────────────────────────────────────
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


# ── USER MANAGEMENT ─────────────────────────────────────────────────────────────
class RoleUpdate(BaseModel):
    is_admin: bool

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    q: Optional[str] = Query(None, description="Filter by name or email"),
    page: int       = Query(1, ge=1),
    limit: int      = Query(20, ge=1, le=100),
):
    skip = (page - 1) * limit
    query: dict = {}
    if q:
        # case‐insensitive name or email match
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]

    cursor = db.users.find(query).skip(skip).limit(limit)
    out = []
    async for u in cursor:
        out.append(user_helper(u))
    return out


@router.put(
    "/users/{user_id}/role",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def change_user_role(
    user_id: str,
    update: RoleUpdate,
):
    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.update_one(
        {"_id": oid},
        {"$set": {"is_admin": update.is_admin}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await db.users.find_one({"_id": oid})
    return user_helper(updated)


# ── PRODUCT MANAGEMENT ─────────────────────────────────────────────────────────
@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    q: Optional[str] = Query(None, description="Filter by product name"),
    page: int       = Query(1, ge=1),
    limit: int      = Query(20, ge=1, le=100),
):
    skip = (page - 1) * limit
    query: dict = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}

    cursor = db.products.find(query).skip(skip).limit(limit)
    out = []
    async for p in cursor:
        out.append(product_helper(p))
    return out


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(product: ProductCreate):
    data = product.model_dump()
    data["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(data)
    new = await db.products.find_one({"_id": result.inserted_id})
    return product_helper(new)


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
async def update_product(
    product_id: str,
    upd: ProductUpdate,
):
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


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_product(product_id: str):
    try:
        oid = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return

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

@router.get("/orders/export")
async def export_orders(admin_user=Depends(require_admin)):
    cursor = db.orders.find({})
    orders = [order_helper(order) async for order in cursor]
    
    def iter_csv():
        yield "OrderID,UserEmail,TotalPrice,Status\n"
        for order in orders:
            yield f"{order['id']},{order['user_email']},{order['total_price']},{order['status']}\n"
    
    return StreamingResponse(iter_csv(), media_type="text/csv")
