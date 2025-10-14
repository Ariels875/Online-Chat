import { useState, KeyboardEvent } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = 'Escribe un mensaje...' 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="message-textarea"
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none',
              overflow: 'auto'
            }}
          />
          <button 
            type="submit" 
            disabled={disabled || !message.trim()}
            className="send-button"
          >
            <span className="send-icon">🚀</span>
          </button>
        </div>
      </form>
    </div>
  );
};