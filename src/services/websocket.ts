import type { WebSocketMessage } from '../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  connect(roomId: string, displayName: string, displayColor: string, userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const encodedColor = encodeURIComponent(displayColor);
      const params = new URLSearchParams({
        roomId,
        displayName,
        displayColor: encodedColor
      });
      
      if (userId) {
        params.append('userId', userId);
      }

      const wsUrl = `ws://onlinechatworker.ascastro875.workers.dev/ws?${params.toString()}`;
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          if (event.code !== 1000) { // Solo reconectar si no fue cierre normal
            this.attemptReconnect(roomId, displayName, displayColor, userId);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(roomId: string, displayName: string, displayColor: string, userId?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(roomId, displayName, displayColor, userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  sendMessage(content: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content
      }));
    }
  }

  addMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    // NO limpiar handlers aquí - se manejan por el componente
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}