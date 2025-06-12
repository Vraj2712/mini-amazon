# app/main.py
from fastapi import FastAPI
from app.auth.routes import router as auth_router
from app.routes.cart_routes import router as cart_router
from app.routes.product_routes import router as product_router
from app.routes.order_routes import router as order_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.admin_routes import router as admin_router
from app.routes.ws_routes import router as ws_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Mini Amazon backend is live!"}
app.include_router(auth_router) 
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(admin_router)
app.include_router(ws_router)

# ────────────────────────────────── CORS SETUP ──────────────────────────────────
origins = [
    "http://localhost:3000",        # your React dev server
    "http://127.0.0.1:3000",        # in case you access via 127.0.0.1
    # (add other origins if necessary, e.g. your production domain)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(admin_router)
app.include_router(ws_router)
