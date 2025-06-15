# app/routes/product_routes.py

from fastapi import APIRouter, HTTPException, Query, Depends, status, UploadFile, File
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
import os, shutil

from app.auth.dependencies import require_admin
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.models.product_model import product_helper
from app.database import db

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = "uploads/products"

# ──────────────────────────────── IMAGE UPLOAD ────────────────────────────────
@router.post("/upload-image", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"/uploads/products/{file.filename}"
        return {"url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ──────────────────────────────── CATEGORIES ────────────────────────────────
@router.get("/categories", response_model=List[str])
async def list_categories():
    cats = await db.products.distinct("category")
    return [c for c in cats if c]

# ──────────────────────────────── GET ALL ────────────────────────────────
@router.get("/", response_model=List[ProductResponse])
async def get_all_products(page: int = 1, limit: int = 12):
    skip = (page - 1) * limit
    cursor = db.products.find().skip(skip).limit(limit)
    results = [product_helper(p) async for p in cursor]
    return results

# ──────────────────────────────── SEARCH ────────────────────────────────
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
        if min_price is not None: pf["$gte"] = min_price
        if max_price is not None: pf["$lte"] = max_price
        query["price"] = pf
    if in_stock is not None: query["in_stock"] = in_stock
    if category: query["category"] = category

    skip = (page - 1) * limit
    cursor = db.products.find(query).skip(skip).limit(limit)
    results = [product_helper(p) async for p in cursor]
    return results

# ──────────────────────────────── GET SINGLE PUBLIC (this is the fix 🔥) ────────────────────────────────
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    try:
        prod = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(prod)
