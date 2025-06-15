from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from app.database import db
from app.schemas.user_schema import UserResponse
from app.models.user_model import user_helper
import os

SECRET_KEY = os.getenv("JWT_SECRET", "supersecret")  # same as in your HTTP token generation
ALGORITHM = "HS256"

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()

        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001)
            return

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if not email:
                await websocket.close(code=4002)
                return

            user_doc = await db.users.find_one({"email": email})
            if not user_doc:
                await websocket.close(code=4003)
                return

            self.active_connections[email] = websocket

        except JWTError:
            await websocket.close(code=4004)
            return

    def disconnect(self, email: str):
        if email in self.active_connections:
            del self.active_connections[email]

    async def push_update(self, email: str, message: dict):
        websocket = self.active_connections.get(email)
        if websocket:
            await websocket.send_json(message)

manager = ConnectionManager()
