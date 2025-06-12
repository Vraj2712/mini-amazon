// src/contexts/WsContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
  } from "react";
  
  const WsContext = createContext({
    /**
     * subscribe(fn) — registers a callback fn(message)
     *    returns an unsubscribe() function
     */
    subscribe: () => {},
  });
  
  export function WsProvider({ children }) {
    const socketRef = useRef(null);
    const listenersRef = useRef(new Set());
  
    useEffect(() => {
      // ← adjust URL if you host your backend elsewhere
      const socket = new WebSocket("ws://localhost:8000/ws");
      socketRef.current = socket;
  
      socket.onmessage = (evt) => {
        let msg;
        try {
          msg = JSON.parse(evt.data);
        } catch {
          return;
        }
        // broadcast to all subscribers
        for (let fn of listenersRef.current) fn(msg);
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
  