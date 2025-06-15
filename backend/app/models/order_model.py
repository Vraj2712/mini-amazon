# app/models/order_model.py

def order_helper(order) -> dict:
    return {
        "id": str(order["_id"]),
        "user_email": order.get("user_email"),
        "total_price": order.get("total_price"),
        "status": order.get("status"),
        "created_at": order.get("created_at"),
        "items": [
            {
                "product_id": item.get("product_id"),
                "quantity": item.get("quantity"),
                "price_at_purchase": item.get("price_at_purchase")
            }
            for item in order.get("items", [])
        ],
        "status_history": [
            {
                "status": history.get("status"),
                "timestamp": history.get("timestamp")
            }
            for history in order.get("status_history", [])
        ]
    }
