import type { Message, User } from '../types';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export const MessageList = ({ messages, currentUser }: MessageListProps) => {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      // Usar la zona horaria local del usuario
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch {
      return '--:--';
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.sender_display_name === currentUser.displayName;
  };

  if (messages.length === 0) {
    return (
      <div className="no-messages">
        <div className="no-messages-icon">💭</div>
        <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isOwn = isOwnMessage(message);
        const showAvatar = index === 0 || 
          messages[index - 1].sender_display_name !== message.sender_display_name;

        return (
          <div 
            key={message.id} 
            className={`message ${isOwn ? 'own' : 'other'}`}
          >
            {!isOwn && showAvatar && (
              <div 
                className="message-avatar"
                style={{ backgroundColor: message.sender_display_color }}
              >
                {message.sender_display_name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="message-content">
              {!isOwn && showAvatar && (
                <div className="message-header">
                  <span 
                    className="sender-name"
                    style={{ color: message.sender_display_color }}
                  >
                    {message.sender_display_name}
                  </span>
                  <span className="message-time">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )}
              
              <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                <p>{message.content}</p>
                {isOwn && (
                  <span className="message-time own">
                    {formatTime(message.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};