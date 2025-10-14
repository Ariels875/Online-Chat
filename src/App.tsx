import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, login, register, loginAnonymous, updateAnonymousUser, logout, colors } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    try {
      await login(username, password);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string) => {
    setLoading(true);
    try {
      await register(username, password);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await loginAnonymous();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleUpdateUser = (displayName: string, color: string) => {
    updateAnonymousUser(displayName, color);
  };

  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        onAnonymous={handleAnonymous}
        loading={loading}
      />
    );
  }

  return (
    <ChatInterface
      user={user}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      colors={colors}
    />
  );
}

export default App;