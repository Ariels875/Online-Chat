import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Message, User, WebSocketMessage, ChatState } from '../types';
import { WebSocketService } from '../services/websocket';
import { api } from '../services/api';

export const useChat = (user: User | null) => {
  const [chatState, setChatState] = useState<ChatState>({
    currentRoom: null,
    messages: [],
    connectedUsers: [],
    isConnected: false
  });

  const [wsService] = useState(() => new WebSocketService());
  const currentRoomRef = useRef<Room | null>(null);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'message':
        if (message.content && message.displayName && message.displayColor) {
          setChatState(prev => {
            // Solo agregar si es exactamente la sala actual usando la ref
            const currentRoomId = currentRoomRef.current?.id || prev.currentRoom?.id;
            if (currentRoomId === (message.roomId || 'global')) {
              // Verificar duplicados
              const isDuplicate = prev.messages.some(m => 
                m.content === message.content && 
                m.sender_display_name === message.displayName &&
                Math.abs(Date.now() - new Date(m.created_at).getTime()) < 2000
              );
              
              if (!isDuplicate) {
                const newMessage: Message = {
                  id: Date.now() + Math.random(),
                  room_id: message.roomId || 'global',
                  sender_user_id: message.userId || null,
                  sender_display_name: message.displayName || 'Usuario',
                  sender_display_color: message.displayColor || '#888888',
                  content: message.content || '',
                  created_at: message.timestamp || new Date().toISOString()
                };
                
                return {
                  ...prev,
                  messages: [...prev.messages, newMessage]
                };
              }
            }
            return prev;
          });
        }
        break;

      case 'user_list':
        if (message.users) {
          // Deduplicar usuarios por ID o displayName
          const userMap = new Map<string, User>();
          message.users.forEach(u => {
            const key = u.userId || u.displayName;
            userMap.set(key, {
              id: u.userId || undefined,
              displayName: u.displayName,
              color: u.displayColor,
              isAnonymous: !u.userId
            });
          });
          const users = Array.from(userMap.values());
          setChatState(prev => ({
            ...prev,
            connectedUsers: users
          }));
        }
        break;

      case 'join':
        if (message.displayName && message.displayColor) {
          const joinUser: User = {
            id: message.userId || undefined,
            displayName: message.displayName,
            color: message.displayColor,
            isAnonymous: !message.userId
          };
          setChatState(prev => {
            // Filtrar por ID si existe, sino por displayName
            const filtered = prev.connectedUsers.filter(u => {
              if (joinUser.id && u.id) {
                return u.id !== joinUser.id;
              }
              return u.displayName !== joinUser.displayName;
            });
            return {
              ...prev,
              connectedUsers: [...filtered, joinUser]
            };
          });
        }
        break;

      case 'leave':
        if (message.displayName) {
          setChatState(prev => ({
            ...prev,
            connectedUsers: prev.connectedUsers.filter(u => 
              u.displayName !== message.displayName
            )
          }));
        }
        break;

      case 'error':
        console.error('WebSocket error:', message.message);
        break;
    }
  }, []);

  useEffect(() => {
    wsService.addMessageHandler(handleWebSocketMessage);
    return () => {
      wsService.removeMessageHandler(handleWebSocketMessage);
    };
  }, [wsService]); // Removido handleWebSocketMessage de dependencias ya que tiene deps vacías

  const joinRoom = useCallback(async (room: Room) => {
    if (!user) return;

    try {
      // Actualizar la ref inmediatamente
      currentRoomRef.current = room;
      
      // Marcar como desconectado primero
      setChatState(prev => ({
        ...prev,
        isConnected: false
      }));

      // Desconectar del WebSocket actual
      wsService.disconnect();
      
      // Esperar un poco para asegurar desconexión
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cargar historial de mensajes
      const { messages } = await api.getRoomMessages(room.id);
      
      // Conectar al nuevo WebSocket primero
      await wsService.connect(
        room.id,
        user.displayName || user.username || 'Usuario',
        user.color,
        user.id
      );
      
      // Actualizar estado con todo junto
      setChatState({
        currentRoom: room,
        messages,
        connectedUsers: [],
        isConnected: true
      });
    } catch (error) {
      console.error('Error joining room:', error);
      setChatState(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  }, [user, wsService]);

  // Reconectar cuando cambie el color del usuario
  useEffect(() => {
    if (chatState.currentRoom && chatState.isConnected && user) {
      // Reconectar con el nuevo color
      const reconnect = async () => {
        try {
          wsService.disconnect();
          await new Promise(resolve => setTimeout(resolve, 100));
          await wsService.connect(
            chatState.currentRoom!.id,
            user.displayName || user.username || 'Usuario',
            user.color,
            user.id
          );
        } catch (error) {
          console.error('Error reconnecting with new color:', error);
        }
      };
      reconnect();
    }
  }, [user?.color]);

  const sendMessage = (content: string) => {
    if (wsService.isConnected() && content.trim()) {
      wsService.sendMessage(content.trim());
    }
  };

  const disconnect = () => {
    wsService.disconnect();
    setChatState({
      currentRoom: null,
      messages: [],
      connectedUsers: [],
      isConnected: false
    });
  };

  return {
    ...chatState,
    joinRoom,
    sendMessage,
    disconnect
  };
};