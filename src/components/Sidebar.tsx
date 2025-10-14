import { useState, useEffect } from 'react';
import type { User, Room } from '../types';
import { api } from '../services/api';
import './Sidebar.css';

interface SidebarProps {
  user: User;
  isAuthenticated: boolean;
  currentRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onShowProfile: () => void;
  onLogout: () => void;
}

export const Sidebar = ({ 
  user, 
  isAuthenticated, 
  currentRoom, 
  onRoomSelect: originalOnRoomSelect, 
  onShowProfile, 
  onLogout 
}: SidebarProps) => {
  // Wrapper para marcar como leído al seleccionar
  const onRoomSelect = (room: Room) => {
    markRoomAsRead(room.id);
    originalOnRoomSelect(room);
  };
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRoomForInvite, setSelectedRoomForInvite] = useState<Room | null>(null);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState<User[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});

  const globalRoom: Room = {
    id: 'global',
    name: 'Chat Global',
    type: 'GLOBAL'
  };

  useEffect(() => {
    if (isAuthenticated && user.id) {
      loadUserRooms();
      loadRoomsWithMessages();
    }
  }, [isAuthenticated, user.id]);

  // Cargar lastSeen desde localStorage
  useEffect(() => {
    if (!user.id) return;
    const saved = localStorage.getItem(`lastSeen_${user.id}`);
    if (saved) {
      try {
        setLastSeen(JSON.parse(saved));
      } catch (e) {
        setLastSeen({});
      }
    }
  }, [user.id]);

  // Polling para actualizar salas con mensajes nuevos y detectar invitaciones
  useEffect(() => {
    if (!isAuthenticated || !user.id) return;
    
    const loadData = async () => {
      await loadUserRooms();
      await loadRoomsWithMessages();
      await loadUnreadCounts();
    };

    loadData();
    const interval = setInterval(loadData, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user.id, lastSeen]);

  const loadUserRooms = async () => {
    if (!user.id) return;
    try {
      const userRooms = await api.getUserRooms(user.id);
      // Enriquecer salas directas con información de participantes
      const enrichedRooms = await Promise.all(
        userRooms.map(async (room) => {
          if (room.type === 'DIRECT') {
            try {
              const participants = await api.getRoomParticipants(room.id);
              const otherUser = participants.find(p => p.id !== user.id);
              return {
                ...room,
                name: otherUser?.username || 'Chat Directo',
                participantUsers: participants
              };
            } catch (error) {
              return room;
            }
          }
          return room;
        })
      );
      // Ordenar por último mensaje (más reciente primero)
      const sortedRooms = enrichedRooms.sort((a, b) => {
        const aTime = a.last_message_at || a.created_at || '0';
        const bTime = b.last_message_at || b.created_at || '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setRooms(sortedRooms);
    } catch (error) {
      console.error('Error loading user rooms:', error);
    }
  };

  const loadRoomsWithMessages = async () => {
    if (!user.id) return;
    try {
      const roomsWithMsgs = await api.getRoomsWithMessages(user.id);
      // Enriquecer y agregar salas que no estén ya en la lista
      const enrichedNewRooms = await Promise.all(
        roomsWithMsgs.map(async (room) => {
          if (room.type === 'DIRECT') {
            try {
              const participants = await api.getRoomParticipants(room.id);
              const otherUser = participants.find(p => p.id !== user.id);
              return {
                ...room,
                name: otherUser?.username || 'Chat Directo',
                participantUsers: participants
              };
            } catch (error) {
              return room;
            }
          }
          return room;
        })
      );
      
      setRooms((prev: Room[]) => {
        const newRooms = [...prev];
        enrichedNewRooms.forEach(newRoom => {
          if (!newRooms.find((r: Room) => r.id === newRoom.id)) {
            newRooms.push(newRoom);
          }
        });
        
        // Ordenar por último mensaje
        return newRooms.sort((a, b) => {
          const aTime = a.last_message_at || a.created_at || '0';
          const bTime = b.last_message_at || b.created_at || '0';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
      });
    } catch (error) {
      console.error('Error loading rooms with messages:', error);
    }
  };

  const loadUnreadCounts = async () => {
    if (!user.id) return;
    try {
      const counts = await api.getUnreadCounts(user.id, lastSeen);
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };


  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() && isAuthenticated) {
      try {
        const results = await api.searchUsers(query.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const createDirectChat = async (targetUser: User) => {
    if (!user.id || !targetUser.id) return;
    try {
      const room = await api.createDirectChat(user.id, targetUser.id);
      // Enriquecer con información del otro usuario
      const enrichedRoom = {
        ...room,
        name: targetUser.username || 'Chat Directo',
        participantUsers: [user, targetUser]
      };
      setRooms((prev: Room[]) => {
        const exists = prev.find((r: Room) => r.id === room.id);
        return exists ? prev : [...prev, enrichedRoom];
      });
      markRoomAsRead(enrichedRoom.id);
      onRoomSelect(enrichedRoom);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const markRoomAsRead = (roomId: string) => {
    const now = new Date().toISOString();
    const newLastSeen = { ...lastSeen, [roomId]: now };
    setLastSeen(newLastSeen);
    if (user.id) {
      localStorage.setItem(`lastSeen_${user.id}`, JSON.stringify(newLastSeen));
    }
    // Limpiar el contador de no leídos
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[roomId];
      return newCounts;
    });
  };

  const createRoom = async () => {
    if (!user.id || !newRoomName.trim()) return;
    try {
      const room = await api.createRoom(newRoomName.trim(), user.id);
      setRooms((prev: Room[]) => {
        const exists = prev.find((r: Room) => r.id === room.id);
        return exists ? prev : [...prev, room];
      });
      setNewRoomName('');
      setShowCreateRoom(false);
      onRoomSelect(room);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };


  const openInviteModal = (room: Room) => {
    setSelectedRoomForInvite(room);
    setShowInviteModal(true);
    setInviteSearchQuery('');
    setInviteSearchResults([]);
  };

  const handleInviteSearch = async (query: string) => {
    setInviteSearchQuery(query);
    if (query.trim() && isAuthenticated) {
      try {
        const results = await api.searchUsers(query.trim());
        // Filtrar el usuario actual
        setInviteSearchResults(results.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error searching users:', error);
        setInviteSearchResults([]);
      }
    } else {
      setInviteSearchResults([]);
    }
  };

  const inviteUserToRoom = async (targetUser: User) => {
    if (!user.id || !selectedRoomForInvite) return;
    try {
      await api.addUserToRoom(selectedRoomForInvite.id, targetUser.id!, user.id);
      alert(`✅ ${targetUser.username} ha sido agregado a "${selectedRoomForInvite.name}"\n\nLa sala aparecerá automáticamente en su lista de chats.`);
      setShowInviteModal(false);
      setInviteSearchQuery('');
      setInviteSearchResults([]);
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('❌ Error al agregar usuario a la sala. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info" onClick={onShowProfile}>
          <div 
            className="user-avatar" 
            style={{ backgroundColor: user.color }}
          >
            {user.displayName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-details">
            <div className="user-name">{user.displayName || 'Usuario'}</div>
            <div className="user-status">
              {isAuthenticated ? 'Autenticado' : 'Anónimo'}
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Salir
        </button>
      </div>

      <div className="sidebar-content">
        {/* Chat Global */}
        <div className="room-section">
          <div 
            className={`room-item ${currentRoom?.id === 'global' ? 'active' : ''}`}
            onClick={() => onRoomSelect(globalRoom)}
          >
            <div className="room-icon global">🌍</div>
            <span>Chat Global</span>
          </div>
        </div>

        {/* Búsqueda de usuarios (solo autenticados) */}
        {isAuthenticated && (
          <div className="search-section">
            <h3>Buscar Usuarios</h3>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((searchUser: User) => (
                  <div 
                    key={searchUser.id}
                    className="search-result"
                    onClick={() => createDirectChat(searchUser)}
                  >
                    <div 
                      className="user-avatar small"
                      style={{ backgroundColor: searchUser.color }}
                    >
                      {searchUser.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span>{searchUser.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Salas del usuario */}
        {isAuthenticated && rooms.length > 0 && (
          <div className="room-section">
            <h3>Mis Chats</h3>
            {rooms.map((room: Room) => (
              <div 
                key={room.id}
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
              >
                <div onClick={() => onRoomSelect(room)} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}>
                  <div className={`room-icon ${room.type?.toLowerCase() || 'group'}`}>
                    {room.type === 'DIRECT' ? '💬' : '👥'}
                  </div>
                  <span>{room.name || `Chat ${room.type}`}</span>
                  {unreadCounts[room.id] && unreadCounts[room.id] > 0 && (
                    <span className="unread-badge">{unreadCounts[room.id]}</span>
                  )}
                </div>
                {room.type === 'GROUP' && room.owner_id === user.id && (
                  <button 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openInviteModal(room);
                    }}
                    className="invite-btn"
                    title="Agregar usuarios"
                  >
                    ➕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Crear sala (solo autenticados) */}
        {isAuthenticated && (
          <div className="create-section">
            {!showCreateRoom ? (
              <button 
                onClick={() => setShowCreateRoom(true)}
                className="create-room-btn"
              >
                + Crear Sala
              </button>
            ) : (
              <div className="create-room-form">
                <input
                  type="text"
                  placeholder="Nombre de la sala"
                  value={newRoomName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoomName(e.target.value)}
                  className="room-name-input"
                />
                <div className="create-actions">
                  <button onClick={createRoom} className="confirm-btn">
                    Crear
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateRoom(false);
                      setNewRoomName('');
                    }}
                    className="cancel-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal de invitación */}
      {showInviteModal && selectedRoomForInvite && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar usuarios a {selectedRoomForInvite.name}</h3>
              <button onClick={() => setShowInviteModal(false)} className="close-btn">✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={inviteSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInviteSearch(e.target.value)}
                className="search-input"
              />
              {inviteSearchResults.length > 0 && (
                <div className="search-results">
                  {inviteSearchResults.map((searchUser: User) => (
                    <div 
                      key={searchUser.id}
                      className="search-result"
                      onClick={() => inviteUserToRoom(searchUser)}
                    >
                      <div 
                        className="user-avatar small"
                        style={{ backgroundColor: searchUser.color }}
                      >
                        {searchUser.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span>{searchUser.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};