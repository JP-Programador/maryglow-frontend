import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://maryglow-backend.onrender.com'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maryglow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('maryglow_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* Extrai uma mensagem de erro amigável da resposta da API */
export function mensagemErro(error) {
  return error.response?.data?.mensagem || 'Ocorreu um erro inesperado. Tente novamente.';
}

export default api;
