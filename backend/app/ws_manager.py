# app/ws_manager.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # maps user_email → list of WebSocket connections
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, email: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(email, []).append(ws)

    def disconnect(self, email: str, ws: WebSocket):
        conns = self.active.get(email)
        if not conns:
            return
        if ws in conns:
            conns.remove(ws)
        if not conns:
            # clean up empty lists
            del self.active[email]

    async def push_update(self, email: str, data: dict):
        """
        Send `data` as JSON to *all* WebSockets open for this user.
        """
        for ws in list(self.active.get(email, [])):
            try:
                await ws.send_json(data)
            except WebSocketDisconnect:
                # auto‐cleanup
                self.disconnect(email, ws)

manager = ConnectionManager()
