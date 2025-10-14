import { useState, useEffect, useRef } from 'react';
import type { User, Room } from '../types';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import './ChatWindow.css';

interface ChatWindowProps {
  user: User;
  currentRoom: Room | null;
}

export const ChatWindow = ({ user, currentRoom }: ChatWindowProps) => {
  const [showUserList, setShowUserList] = useState(false);
  const { messages, connectedUsers, isConnected, sendMessage, joinRoom } = useChat(user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Unirse a la sala cuando cambia currentRoom
    if (currentRoom && currentRoom.id !== lastRoomIdRef.current) {
      lastRoomIdRef.current = currentRoom.id;
      joinRoom(currentRoom);
    }
  }, [currentRoom, joinRoom]);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  if (!currentRoom) {
    return (
      <div className="chat-window">
        <div className="no-room">
          <div className="no-room-icon">💬</div>
          <h2>Selecciona una sala para comenzar</h2>
          <p>Elige el Chat Global o una de tus salas para empezar a chatear</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="room-info">
          <div className={`room-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
          </div>
          <div className="room-details">
            <h2>{currentRoom.name || 'Chat'}</h2>
            <span className="room-type">
              {currentRoom.type === 'GLOBAL' && 'Chat Global'}
              {currentRoom.type === 'DIRECT' && 'Mensaje Directo'}
              {currentRoom.type === 'GROUP' && 'Sala Grupal'}
            </span>
          </div>
        </div>
        
        <div className="chat-actions">
          <button 
            onClick={() => setShowUserList(!showUserList)}
            className="users-btn"
          >
            👥 {connectedUsers.length}
          </button>
        </div>
      </div>

      <div className="chat-body">
        <div className="messages-container">
          <MessageList messages={messages} currentUser={user} />
          <div ref={messagesEndRef} />
        </div>
        
        {showUserList && (
          <UserList 
            users={connectedUsers} 
            onClose={() => setShowUserList(false)} 
          />
        )}
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={!isConnected}
        placeholder={
          isConnected 
            ? `Escribe un mensaje en ${currentRoom.name || 'el chat'}...`
            : 'Conectando...'
        }
      />
    </div>
  );
};