# app/schemas/product_schema.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str]
    price: float
    in_stock: bool = True
    category: Optional[str] = None    # ← new line

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    in_stock: Optional[bool]
    category: Optional[str] = None    # ← new line

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    category: Optional[str] = None    # ← new line

    model_config = {
        "from_attributes": True
    }
