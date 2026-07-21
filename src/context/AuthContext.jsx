import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('maryglow_token');
    if (!token) {
      setCarregando(false);
      return;
    }
    authService
      .buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => localStorage.removeItem('maryglow_token'))
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const { token, usuario: usuarioLogado } = await authService.login(email, senha);
    localStorage.setItem('maryglow_token', token);
    setUsuario(usuarioLogado);
    return usuarioLogado;
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem('maryglow_token');
    setUsuario(null);
  }, []);

  const ehAdmin = usuario?.nivel === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair, ehAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return contexto;
}
