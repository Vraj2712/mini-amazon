# app/routes/product_routes.py

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.models.product_model import product_helper
from app.database import db
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/products", tags=["Products"])


# ─────────────────────────────────────────────────────────────
# Create a product (admins only)
# ─────────────────────────────────────────────────────────────
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)]
)
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(product_dict)
    new_prod = await db.products.find_one({"_id": result.inserted_id})
    return product_helper(new_prod)


# ─────────────────────────────────────────────────────────────
# Get all products (with pagination)
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ProductResponse])
async def get_all_products(
    page: int = 1,
    limit: int = 12,
):
    skip = (page - 1) * limit
    cursor = db.products.find().skip(skip).limit(limit)
    results = [product_helper(p) async for p in cursor]
    return results


# ─────────────────────────────────────────────────────────────
# List distinct categories
# ─────────────────────────────────────────────────────────────
@router.get("/categories", response_model=List[str])
async def list_categories():
    cats = await db.products.distinct("category")
    return [c for c in cats if c]


# ─────────────────────────────────────────────────────────────
# Search/filter products
# ─────────────────────────────────────────────────────────────
@router.get("/search", response_model=List[ProductResponse])
async def search_products(
    q: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    in_stock: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    page: int = 1,
    limit: int = 12,
):
    query: dict = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if min_price is not None or max_price is not None:
        pf: dict = {}
        if min_price is not None:
            pf["$gte"] = min_price
        if max_price is not None:
            pf["$lte"] = max_price
        query["price"] = pf
    if in_stock is not None:
        query["in_stock"] = in_stock
    if category:
        query["category"] = category

    skip = (page - 1) * limit
    cursor = db.products.find(query).skip(skip).limit(limit)
    results = [product_helper(p) async for p in cursor]
    return results


# ─────────────────────────────────────────────────────────────
# Get a single product by ID
# ─────────────────────────────────────────────────────────────
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    try:
        prod = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(prod)


# ─────────────────────────────────────────────────────────────
# Update a product (admins only)
# ─────────────────────────────────────────────────────────────
@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_admin)]
)
async def update_product(product_id: str, update: ProductUpdate):
    try:
        data = {k: v for k, v in update.model_dump().items() if v is not None}
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    return product_helper(updated)


# ─────────────────────────────────────────────────────────────
# Delete a product (admins only)
# ─────────────────────────────────────────────────────────────
@router.delete(
    "/{product_id}",
    dependencies=[Depends(require_admin)]
)
async def delete_product(product_id: str):
    try:
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ─────────────────────────────────────────────────────────────
# Get products by category
# ─────────────────────────────────────────────────────────────
@router.get("/category/{category_name}", response_model=List[ProductResponse])
async def get_by_category(category_name: str):
    cursor = db.products.find({"category": category_name})
    results = [product_helper(p) async for p in cursor]
    return results
