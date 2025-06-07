# app/models/order_model.py

from bson import ObjectId
from datetime import datetime
from typing import Any, Dict

def order_helper(order: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert a raw MongoDB order document into a dict that matches OrderResponse.
    Assumes `order` contains at least: 
      - "_id"
      - "user_email"
      - "items": list of {product_id, quantity, price_at_purchase}
      - "status"
      - "total_price"
      - "created_at"
    """
    return {
        "id": str(order["_id"]),
        "user_email": order.get("user_email", ""),
        "status": order.get("status", ""),
        "items": [
            {
                "product_id": item.get("product_id", ""),
                "quantity": item.get("quantity", 0),
                "price_at_purchase": item.get("price_at_purchase", 0.0),
            }
            for item in order.get("items", [])
        ],
        "total_price": order.get("total_price", 0.0),
        "created_at": order.get("created_at", datetime.utcnow()),
    }
