export interface User {
  id?: string;
  username?: string;
  displayName: string;
  color: string;
  isAnonymous?: boolean;
}

export interface Room {
  id: string;
  name?: string;
  type: 'GLOBAL' | 'GROUP' | 'DIRECT';
  owner_id?: string;
  participants?: string[];
  participantUsers?: User[];
  created_at?: string;
  participant_count?: number;
  is_private?: boolean;
  last_message_at?: string;
}

export interface Message {
  id: number;
  room_id: string;
  sender_user_id?: string | null;
  sender_display_name: string;
  sender_display_color: string;
  content: string;
  created_at: string;
}

export interface WebSocketMessage {
  type: 'message' | 'join' | 'leave' | 'user_list' | 'error';
  roomId?: string;
  userId?: string | null;
  displayName?: string;
  displayColor?: string;
  content?: string;
  timestamp?: string;
  users?: Array<{
    userId: string | null;
    displayName: string;
    displayColor: string;
  }>;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ChatState {
  currentRoom: Room | null;
  messages: Message[];
  connectedUsers: User[];
  isConnected: boolean;
}