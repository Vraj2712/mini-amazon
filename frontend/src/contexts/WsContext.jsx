// src/contexts/WsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";

// Create WebSocket Context
const WsContext = createContext({
  subscribe: () => {},
});

export function WsProvider({ children }) {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  useEffect(() => {
    // ✅ GET token from localStorage (or wherever you store it after login)
    const token = localStorage.getItem("token");  // <--- the fix

    // ✅ If no token, don't even try to open websocket
    if (!token) {
      console.warn("No token found for WebSocket connection");
      return;
    }

    const socket = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        console.error("Failed to parse WebSocket message:", evt.data);
        return;
      }
      for (let fn of listenersRef.current) fn(msg);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.warn("WebSocket connection closed");
    };

    return () => {
      socket.close();
      listenersRef.current.clear();
    };
  }, []);

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  return (
    <WsContext.Provider value={{ subscribe }}>
      {children}
    </WsContext.Provider>
  );
}

export function useWs(onMessage) {
  const { subscribe } = useContext(WsContext);
  useEffect(() => {
    const unsubscribe = subscribe(onMessage);
    return unsubscribe;
  }, [onMessage, subscribe]);
}
