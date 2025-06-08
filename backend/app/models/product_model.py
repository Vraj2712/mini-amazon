# app/models/product_model.py

def product_helper(prod: dict) -> dict:
    return {
        "id": str(prod["_id"]),
        "name": prod["name"],
        "description": prod.get("description"),
        "price": prod["price"],
        "in_stock": prod.get("in_stock", True),
        "category": prod.get("category"),    # ← make sure this is here
        "created_at": prod["created_at"],
    }
