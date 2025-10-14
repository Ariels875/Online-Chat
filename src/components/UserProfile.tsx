import { useState } from 'react';
import type { User } from '../types';
import './UserProfile.css';

interface UserProfileProps {
  user: User;
  isAuthenticated: boolean;
  colors: string[];
  onUpdateUser: (displayName: string, color: string) => void;
  onClose: () => void;
}

export const UserProfile = ({ 
  user, 
  isAuthenticated, 
  colors, 
  onUpdateUser, 
  onClose 
}: UserProfileProps) => {
  const [displayName, setDisplayName] = useState(user.displayName || user.username || 'Usuario');
  const [selectedColor, setSelectedColor] = useState(user.color);

  const handleSave = () => {
    if (displayName.trim()) {
      onUpdateUser(displayName.trim(), selectedColor);
    }
    onClose();
  };

  return (
    <div className="user-profile-overlay">
      <div className="user-profile-modal glow">
        <div className="profile-header">
          <h2>Perfil de Usuario</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="profile-content">
          <div className="avatar-section">
            <div 
              className="profile-avatar"
              style={{ backgroundColor: selectedColor }}
            >
              {displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Nombre de Usuario</label>
              {isAuthenticated ? (
                <div className="readonly-field">
                  <span>{user.username}</span>
                  <small>Usuario autenticado</small>
                </div>
              ) : (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="profile-input"
                />
              )}
            </div>

            <div className="form-group">
              <label>Nombre a Mostrar</label>
              {isAuthenticated ? (
                <div className="readonly-field">
                  <span>{user.displayName || user.username || 'Usuario'}</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nombre a mostrar en el chat"
                  className="profile-input"
                />
              )}
            </div>

            <div className="form-group">
              <label>Color de Avatar y Nombre</label>
              <small style={{ color: '#888', marginBottom: '8px', display: 'block' }}>
                Selecciona el color que se mostrará en tu avatar y en tu nombre de usuario en todos los mensajes del chat
              </small>
              <div className="color-picker">
                {colors.map(color => (
                  <div
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedColor(color);
                      }
                    }}
                  />
                ))}
              </div>
              {isAuthenticated && (
                <small style={{ color: '#888', marginTop: '8px', display: 'block' }}>
                  Los cambios de color se aplicarán en tu próxima conexión
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Estado</label>
              <div className="status-info">
                <div className={`status-badge ${isAuthenticated ? 'authenticated' : 'anonymous'}`}>
                  {isAuthenticated ? '🔐 Autenticado' : '👤 Anónimo'}
                </div>
                <small>
                  {isAuthenticated 
                    ? 'Puedes crear salas y enviar mensajes directos'
                    : 'Solo puedes usar el chat global'
                  }
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            onClick={handleSave}
            className="save-btn"
            disabled={!displayName.trim()}
          >
            Guardar Cambios
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};