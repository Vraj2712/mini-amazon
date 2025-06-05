from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.models.product_model import product_helper
from app.database import db

router = APIRouter(prefix="/products", tags=["Products"])


# ─────────────────────────────────────────────────────────────
# Create a product
# ─────────────────────────────────────────────────────────────
@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["created_at"] = datetime.utcnow()
    # Insert into MongoDB
    result = await db.products.insert_one(product_dict)
    new_product = await db.products.find_one({"_id": result.inserted_id})
    return product_helper(new_product)


# ─────────────────────────────────────────────────────────────
# Get all products (with optional pagination)
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ProductResponse])
async def get_all_products(
    page: int = 1,
    limit: int = 12,
):
    skip = (page - 1) * limit
    cursor = db.products.find().skip(skip).limit(limit)
    results = []
    async for prod in cursor:
        results.append(product_helper(prod))
    return results


# ─────────────────────────────────────────────────────────────
# List distinct categories
# ─────────────────────────────────────────────────────────────
@router.get("/categories", response_model=List[str])
async def list_categories():
    distinct_cats = await db.products.distinct("category")
    return [c for c in distinct_cats if c]


# ─────────────────────────────────────────────────────────────
# Search products by name, price range, in_stock, category, pagination
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
    query = {}

    if q:
        query["name"] = {"$regex": q, "$options": "i"}

    if (min_price is not None) or (max_price is not None):
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["price"] = price_filter

    if in_stock is not None:
        query["in_stock"] = in_stock

    if category:
        query["category"] = category

    skip = (page - 1) * limit
    cursor = db.products.find(query).skip(skip).limit(limit)

    results = []
    async for prod in cursor:
        results.append(product_helper(prod))

    return results


# ─────────────────────────────────────────────────────────────
# Get a single product by ID
# ─────────────────────────────────────────────────────────────
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(product)


# ─────────────────────────────────────────────────────────────
# Update a product
# ─────────────────────────────────────────────────────────────
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, update: ProductUpdate):
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not updated")

    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return product_helper(updated_product)


# ─────────────────────────────────────────────────────────────
# Delete a product
# ─────────────────────────────────────────────────────────────
@router.delete("/{product_id}")
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
async def get_products_by_category(category_name: str):
    cursor = db.products.find({"category": category_name})
    results = []
    async for prod in cursor:
        results.append(product_helper(prod))
    return results

@router.get("/categories", response_model=List[str])
async def list_categories():
    """
    Return a deduplicated list of all category strings, e.g. ["Electronics", "Clothing", …]
    """
    distinct_cats = await db.products.distinct("category")
    # filter out any empty or None values
    return [c for c in distinct_cats if c]

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
    query = {}

    if q:
        query["name"] = {"$regex": q, "$options": "i"}

    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["price"] = price_filter

    if in_stock is not None:
        query["in_stock"] = in_stock

    if category:
        query["category"] = category

    # Pagination: skip / limit
    skip = (page - 1) * limit
    cursor = db.products.find(query).skip(skip).limit(limit)

    results = []
    async for prod in cursor:
        results.append(product_helper(prod))
    return results