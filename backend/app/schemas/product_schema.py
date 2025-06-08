# app/schemas/product_schema.py

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    description: Optional[str] = None
    price: float
    in_stock: bool = True
    category: Optional[str] = None    # ← added here

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    in_stock: Optional[bool] = None
    category: Optional[str] = None    # ← and here

class ProductResponse(ProductBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
