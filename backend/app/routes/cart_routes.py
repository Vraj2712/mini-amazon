# app/routes/cart_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.cart_schema import (
    CartAddRequest,
    CartUpdateRequest,
    CartResponse
)
from app.auth.dependencies import get_current_user
from app.models.cart_model import cart_helper
from app.database import db

router = APIRouter(prefix="/cart", tags=["Cart"])


# ─── VIEW CART ────────────────────────────────────────────────────────────────────
@router.get("/", response_model=CartResponse)
async def get_cart(current_user=Depends(get_current_user)):
    """
    Fetch the current user's cart.  If no cart exists yet, return an empty items list.
    """
    cart = await db.carts.find_one({"user_email": current_user.email})
    if not cart:
        # Return an empty cart structure if this user has none
        return CartResponse(user_email=current_user.email, items=[])
    # Use cart_helper to shape the response into the Pydantic schema
    return cart_helper(cart)


# ─── ADD ITEM TO CART ────────────────────────────────────────────────────────────
@router.post("/add", response_model=CartResponse, status_code=status.HTTP_200_OK)
async def add_to_cart(
    item: CartAddRequest,
    current_user=Depends(get_current_user)
):
    """
    Add a product to the user's cart. If the cart doesn't exist, create it.
    If the product_id already exists, increment its quantity.
    """
    cart = await db.carts.find_one({"user_email": current_user.email})

    if not cart:
        # Create a new cart document with this single item
        new_cart = {
            "user_email": current_user.email,
            "items": [
                {"product_id": item.product_id, "quantity": item.quantity}
            ],
        }
        await db.carts.insert_one(new_cart)
        return cart_helper(new_cart)

    # Cart exists: check if this product_id is already in "items"
    found = False
    for existing_item in cart["items"]:
        if existing_item["product_id"] == item.product_id:
            existing_item["quantity"] += item.quantity
            found = True
            break

    if not found:
        cart["items"].append({"product_id": item.product_id, "quantity": item.quantity})

    # Persist the updated "items" list
    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": cart["items"]}}
    )

    return cart_helper(cart)


# ─── UPDATE QUANTITY (OR REMOVE IF ZERO) ─────────────────────────────────────────
@router.put("/update", response_model=CartResponse, status_code=status.HTTP_200_OK)
async def update_cart_item(
    update: CartUpdateRequest,
    current_user=Depends(get_current_user)
):
    """
    Change the quantity of an existing product in the cart.
    If quantity == 0 → remove that product from the cart entirely.
    If the cart or item isn't found → return 404.
    """
    cart = await db.carts.find_one({"user_email": current_user.email})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # If the client sent quantity=0, remove that product from the array instead of setting zero
    if update.quantity == 0:
        new_items = [item for item in cart["items"] if item["product_id"] != update.product_id]
        if len(new_items) == len(cart["items"]):
            # No change → that product_id was not in the cart
            raise HTTPException(status_code=404, detail="Item not found in cart")

        # Persist the filtered array
        await db.carts.update_one(
            {"user_email": current_user.email},
            {"$set": {"items": new_items}}
        )
        updated_cart = {**cart, "items": new_items}
        return cart_helper(updated_cart)

    # Otherwise (quantity > 0), find and overwrite the item's quantity
    updated = False
    for idx, existing_item in enumerate(cart["items"]):
        if existing_item["product_id"] == update.product_id:
            cart["items"][idx]["quantity"] = update.quantity
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # Persist the new quantity
    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": cart["items"]}}
    )

    return cart_helper(cart)


# ─── REMOVE ITEM FROM CART ──────────────────────────────────────────────────────
@router.delete("/{product_id}", response_model=CartResponse, status_code=status.HTTP_200_OK)
async def remove_from_cart(
    product_id: str,
    current_user=Depends(get_current_user)
):
    """
    Remove exactly one product (matching product_id) from the user's cart.
    If the cart or item is not found, raises 404. Otherwise returns the updated cart.
    """
    cart = await db.carts.find_one({"user_email": current_user.email})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    new_items = [item for item in cart["items"] if item["product_id"] != product_id]
    if len(new_items) == len(cart["items"]):
        raise HTTPException(status_code=404, detail="Item not found in cart")

    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": new_items}}
    )

    updated_cart = {**cart, "items": new_items}
    return cart_helper(updated_cart)


# ─── CLEAR ENTIRE CART ───────────────────────────────────────────────────────────
@router.delete("/", status_code=status.HTTP_200_OK)
async def clear_cart(current_user=Depends(get_current_user)):
    """
    Completely empty the user's cart in one call.
    """
    await db.carts.update_one(
        {"user_email": current_user.email},
        {"$set": {"items": []}}
    )
    return CartResponse(user_email=current_user.email, items=[])
