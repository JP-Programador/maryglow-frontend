import api from './api';

export async function buscarDashboard() {
  const { data } = await api.get('/dashboard');
  return data.dashboard;
}
