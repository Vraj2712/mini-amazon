from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws_manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        # On disconnect, we remove user
        for email, ws in manager.active_connections.items():
            if ws == websocket:
                manager.disconnect(email)
                break
