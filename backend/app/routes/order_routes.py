# app/routes/order_routes.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId

from app.schemas.order_schema import OrderResponse, OrderStatusUpdate
from app.models.order_model import order_helper
from app.auth.dependencies import get_current_user, require_admin
from app.database import db

router = APIRouter(prefix="/orders", tags=["Orders"])


# ── PLACE ORDER ──────────────────────────────────────────────────────────────────────
@router.post("/", response_model=OrderResponse, status_code=201)
async def place_order(current_user=Depends(get_current_user)):
    """
    Take all items from the user's cart, freeze each item's price as `price_at_purchase`,
    compute `total_price`, insert a new order document, then clear the cart. 
    Returns the newly‐created order.
    """
    # 1) Fetch the user's cart
    cart = await db.carts.find_one({"user_email": current_user.email})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2) Build order_items with price_at_purchase & accumulate total_price
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
        quantity = ci["quantity"]

        order_items.append({
            "product_id": ci["product_id"],
            "quantity": quantity,
            "price_at_purchase": price,
        })
        total_price += price * quantity

    # 3) Insert the new order document (with total_price)
    new_order_doc = {
        "user_email": current_user.email,
        "items": order_items,
        "total_price": total_price,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    result = await db.orders.insert_one(new_order_doc)
    saved_order = await db.orders.find_one({"_id": result.inserted_id})

    # 4) Clear the cart afterwards
    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": []}}
    )

    return order_helper(saved_order)


# ── GET ALL ORDERS FOR CURRENT USER ────────────────────────────────────────────────
@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(current_user=Depends(get_current_user)):
    """
    Return a list of all orders placed by the current user.
    """
    cursor = db.orders.find({"user_email": current_user.email})
    orders = []
    async for order in cursor:
        orders.append(order_helper(order))
    return orders


# ── UPDATE ORDER STATUS (ADMIN ONLY) ────────────────────────────────────────────────
@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    admin_user=Depends(require_admin)
):
    """
    Allow an admin to change an order's status (pending, shipped, delivered, cancelled).
    """
    # Validate & parse ObjectId
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    order = await db.orders.find_one({"_id": oid})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Validate new status
    VALID_STATUSES = ["pending", "shipped", "delivered", "cancelled"]
    if update.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status value")

    # Persist change
    await db.orders.update_one(
        {"_id": oid},
        {"$set": {"status": update.status}}
    )

    updated_order = await db.orders.find_one({"_id": oid})
    return order_helper(updated_order)
