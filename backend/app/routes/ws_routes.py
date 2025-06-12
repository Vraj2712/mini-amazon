# app/routes/ws_routes.py
from fastapi import APIRouter, Depends, WebSocket
from app.auth.dependencies import get_current_user
from app.ws_manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, current_user=Depends(get_current_user)):
    # note: you’ll need to upgrade your oauth dependency to accept WebSocket
    await manager.connect(current_user.email, ws)
    try:
        while True:
            await ws.receive_text()  # keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(current_user.email, ws)
