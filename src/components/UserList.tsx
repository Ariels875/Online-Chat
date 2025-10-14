import type { User } from '../types';
import './UserList.css';

interface UserListProps {
  users: User[];
  onClose: () => void;
}

export const UserList = ({ users, onClose }: UserListProps) => {
  return (
    <div className="user-list-panel">
      <div className="user-list-header">
        <h3>Usuarios Conectados ({users.length})</h3>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>
      
      <div className="user-list-content">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No hay usuarios conectados</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user, index) => (
              <div key={`${user.displayName}-${index}`} className="user-item">
                <div 
                  className="user-avatar"
                  style={{ backgroundColor: user.color }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.displayName}</div>
                  <div className="user-status">
                    {user.isAnonymous ? 'Anónimo' : 'Registrado'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};