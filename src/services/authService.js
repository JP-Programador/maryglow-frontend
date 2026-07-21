import api from './api';

export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data; // { sucesso, token, usuario }
}

export async function buscarUsuarioLogado() {
  const { data } = await api.get('/auth/me');
  return data.usuario;
}
