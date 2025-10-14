import type { User, Room, Message } from '../types';

const API_BASE = 'https://onlinechatworker.ascastro875.workers.dev';

export const api = {
  // Usuarios
  async registerUser(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Error al registrar usuario');
    return response.json();
  },

  async loginUser(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Credenciales inválidas');
    return response.json();
  },

  async createAnonymousUser(displayName?: string, color?: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, color })
    });
    if (!response.ok) throw new Error('Error al crear usuario anónimo');
    return response.json();
  },

  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error al buscar usuarios');
    return response.json();
  },

  async updateUserColor(userId: string, color: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${userId}/color`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color })
    });
    if (!response.ok) throw new Error('Error al actualizar color');
  },

  // Salas
  async createRoom(name: string, userId: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId })
    });
    if (!response.ok) throw new Error('Error al crear sala');
    return response.json();
  },

  async createDirectChat(userId1: string, userId2: string): Promise<Room> {
    const response = await fetch(`${API_BASE}/rooms/direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId1, userId2 })
    });
    if (!response.ok) throw new Error('Error al crear chat directo');
    return response.json();
  },

  async joinRoom(roomId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId })
    });
    if (!response.ok) throw new Error('Error al unirse a la sala');
  },

  async getUserRooms(userId: string): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/rooms/user/${userId}`);
    if (!response.ok) throw new Error('Error al obtener salas del usuario');
    return response.json();
  },

  async getPublicRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/rooms/public`);
    if (!response.ok) throw new Error('Error al obtener salas públicas');
    return response.json();
  },

  async addUserToRoom(roomId: string, userId: string, invitedBy: string): Promise<void> {
    const response = await fetch(`${API_BASE}/rooms/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId, invitedBy })
    });
    if (!response.ok) throw new Error('Error al agregar usuario a la sala');
  },

  async getRoomParticipants(roomId: string): Promise<User[]> {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/participants`);
    if (!response.ok) throw new Error('Error al obtener participantes');
    return response.json();
  },

  async getRoomsWithMessages(userId: string): Promise<Room[]> {
    const response = await fetch(`${API_BASE}/messages/user/${userId}/rooms-with-messages`);
    if (!response.ok) throw new Error('Error al obtener salas con mensajes');
    return response.json();
  },

  async getUnreadCounts(userId: string, lastSeen: Record<string, string>): Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE}/messages/user/${userId}/unread-counts?lastSeen=${encodeURIComponent(JSON.stringify(lastSeen))}`);
    if (!response.ok) return {};
    return response.json();
  },

  // Mensajes
  async sendMessage(
    roomId: string,
    content: string,
    senderUserId?: string,
    senderDisplayName?: string,
    senderDisplayColor?: string
  ): Promise<Message> {
    const response = await fetch(`${API_BASE}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        content,
        senderUserId,
        senderDisplayName,
        senderDisplayColor
      })
    });
    if (!response.ok) throw new Error('Error al enviar mensaje');
    return response.json();
  },

  async getRoomMessages(roomId: string, limit = 50, offset = 0): Promise<{ messages: Message[], hasMore: boolean }> {
    const response = await fetch(`${API_BASE}/messages/room/${roomId}?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Error al obtener mensajes');
    return response.json();
  },

  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  }
};