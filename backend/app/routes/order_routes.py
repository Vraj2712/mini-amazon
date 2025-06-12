# app/routes/order_routes.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.ws_manager import manager
from app.schemas.order_schema import OrderResponse, OrderStatusUpdate
from app.models.order_model import order_helper
from app.auth.dependencies import get_current_user, require_admin
from app.database import db

router = APIRouter(prefix="/orders", tags=["Orders"])

# ───────────────────────────────────────────────────────────────────────────────

@router.post("/", response_model=OrderResponse, status_code=201)
async def place_order(current_user=Depends(get_current_user)):
    cart = await db.carts.find_one({"user_email": current_user.email})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total_price = 0.0

    for ci in cart["items"]:
        prod = await db.products.find_one({"_id": ObjectId(ci["product_id"])})
        if not prod:
            raise HTTPException(
                status_code=404,
                detail=f"Product {ci['product_id']} not found"
            )
        price = prod["price"]
        qty = ci["quantity"]
        order_items.append({
            "product_id": ci["product_id"],
            "quantity": qty,
            "price_at_purchase": price,
        })
        total_price += price * qty

    new_order = {
        "user_email": current_user.email,
        "items": order_items,
        "total_price": total_price,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "status_history": [
            {
                "status": "pending",
                "timestamp": datetime.utcnow()
            }
        ]
    }
    result = await db.orders.insert_one(new_order)
    saved = await db.orders.find_one({"_id": result.inserted_id})

    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": []}}
    )

    return order_helper(saved)

# ───────────────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(current_user=Depends(get_current_user)):
    cursor = db.orders.find({"user_email": current_user.email})
    orders: List[OrderResponse] = []
    async for order in cursor:
        orders.append(order_helper(order))
    return orders

# ───────────────────────────────────────────────────────────────────────────────

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    admin_user=Depends(require_admin)
):
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    order_doc = await db.orders.find_one({"_id": oid})
    if not order_doc:
        raise HTTPException(status_code=404, detail="Order not found")

    VALID_STATUSES = ["pending", "shipped", "delivered", "cancelled"]
    if update.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status value")

    # ✅ UPDATED HERE — log status history
    await db.orders.update_one(
        {"_id": oid},
        {
            "$set": {"status": update.status},
            "$push": {
                "status_history": {
                    "status": update.status,
                    "timestamp": datetime.utcnow()
                }
            }
        }
    )

    updated_doc = await db.orders.find_one({"_id": oid})
    order_obj = order_helper(updated_doc)

    await manager.push_update(
        updated_doc["user_email"],
        {
            "type": "order_update",
            "order_id": order_id,
            "new_status": update.status
        }
    )

    return order_obj
