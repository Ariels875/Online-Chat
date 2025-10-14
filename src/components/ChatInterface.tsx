import { useState } from 'react';
import type { User, Room } from '../types';
import { ChatWindow } from './ChatWindow';
import { Sidebar } from './Sidebar';
import { UserProfile } from './UserProfile';
import './ChatInterface.css';

interface ChatInterfaceProps {
  user: User;
  isAuthenticated: boolean;
  onLogout: () => void;
  onUpdateUser: (displayName: string, color: string) => void;
  colors: string[];
}

export const ChatInterface = ({ 
  user, 
  isAuthenticated, 
  onLogout, 
  onUpdateUser, 
  colors 
}: ChatInterfaceProps) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="chat-interface">
      <Sidebar
        user={user}
        isAuthenticated={isAuthenticated}
        currentRoom={currentRoom}
        onRoomSelect={setCurrentRoom}
        onShowProfile={() => setShowProfile(true)}
        onLogout={onLogout}
      />
      
      <div className="main-content">
        <ChatWindow
          user={user}
          currentRoom={currentRoom}
        />
      </div>

      {showProfile && (
        <UserProfile
          user={user}
          isAuthenticated={isAuthenticated}
          colors={colors}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};