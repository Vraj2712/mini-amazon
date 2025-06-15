# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from app.auth.routes import router as auth_router
from app.routes.cart_routes import router as cart_router
from app.routes.product_routes import router as product_router
from app.routes.order_routes import router as order_router
from app.routes.admin_routes import router as admin_router
from app.routes.ws_routes import router as ws_router

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Initialize FastAPI app
app = FastAPI()

# ✅ Setup CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Health check route
@app.get("/")
def read_root():
    return {"message": "Mini Amazon backend is live!"}

# ✅ Register routers
app.include_router(auth_router) 
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(admin_router)
app.include_router(ws_router)

# ✅ Serve uploads directory as static files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
