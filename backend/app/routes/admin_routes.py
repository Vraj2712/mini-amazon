# app/routes/admin_routes.py
from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import require_admin
from app.database import db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
async def get_admin_stats(admin_user=Depends(require_admin)):
    """
    Return aggregate counts for users, products, orders, 
    plus a breakdown of orders by status.
    """
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})

    # statuses you support
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
