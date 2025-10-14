import { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  onAnonymous: () => void;
  loading: boolean;
}

export const LoginForm = ({ onLogin, onRegister, onAnonymous, loading }: LoginFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setError('');
      if (isLogin) {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la operación');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form glow">
        <h1 className="login-title">
          <span className="title-text">ArielsChat</span>
          <div className="title-underline"></div>
        </h1>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
            disabled={loading}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
          
          <div className="divider">
            <span>O</span>
          </div>
          
          <button
            type="button"
            onClick={onAnonymous}
            className="anonymous-btn"
            disabled={loading}
          >
            Entrar como Anónimo
          </button>
        </div>
      </div>
    </div>
  );
};