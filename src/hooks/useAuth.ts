import { useState, useEffect } from 'react';
import type { AuthState } from '../types';
import { api } from '../services/api';

const COLORS = [
  '#FF6B6B', // Rojo coral
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul cielo
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarillo suave
  '#DDA0DD', // Lavanda
  '#98D8C8', // Verde agua
  '#F7DC6F', // Amarillo dorado
  '#FF8B94', // Rosa salmón
  '#A8E6CF', // Verde pastel
  '#FFD3B6', // Melocotón
  '#FFAAA5', // Rosa coral
  '#FF8C94', // Rosa fuerte
  '#A8D8EA', // Azul claro
  '#AA96DA', // Púrpura suave
  '#FCBAD3', // Rosa chicle
  '#FFFFD2', // Amarillo pálido
  '#B4E7CE', // Verde menta claro
  '#F38181', // Rojo rosado
  '#95E1D3'  // Turquesa claro
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const userWithDisplayName = {
          ...user,
          displayName: user.displayName || user.username || 'Usuario'
        };
        setAuthState({
          user: userWithDisplayName,
          isAuthenticated: !!user.id
        });
      } catch (error) {
        localStorage.removeItem('chatUser');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const user = await api.loginUser(username, password);
      const userWithDisplayName = {
        ...user,
        displayName: user.displayName || user.username || 'Usuario'
      };
      setAuthState({
        user: userWithDisplayName,
        isAuthenticated: true
      });
      localStorage.setItem('chatUser', JSON.stringify(userWithDisplayName));
      return userWithDisplayName;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const user = await api.registerUser(username, password);
      const userWithDisplayName = {
        ...user,
        displayName: user.displayName || user.username || 'Usuario'
      };
      setAuthState({
        user: userWithDisplayName,
        isAuthenticated: true
      });
      localStorage.setItem('chatUser', JSON.stringify(userWithDisplayName));
      return userWithDisplayName;
    } catch (error) {
      throw error;
    }
  };

  const loginAnonymous = async (displayName?: string, color?: string) => {
    try {
      const randomColor = color || COLORS[Math.floor(Math.random() * COLORS.length)];
      const user = await api.createAnonymousUser(displayName, randomColor);
      setAuthState({
        user,
        isAuthenticated: false
      });
      localStorage.setItem('chatUser', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const updateAnonymousUser = async (displayName: string, color: string) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        displayName,
        color
      };
      
      // Si es usuario autenticado, actualizar en la base de datos
      if (authState.isAuthenticated && authState.user.id) {
        try {
          await api.updateUserColor(authState.user.id, color);
        } catch (error) {
          console.error('Error updating user color:', error);
        }
      }
      
      setAuthState({
        ...authState,
        user: updatedUser
      });
      localStorage.setItem('chatUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    localStorage.removeItem('chatUser');
  };

  return {
    ...authState,
    login,
    register,
    loginAnonymous,
    updateAnonymousUser,
    logout,
    colors: COLORS
  };
};