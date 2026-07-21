// frontend/src/components/usuarios/UsuarioForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';

export function UsuarioForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel: 'funcionario', // Backend exige 'funcionario' ou 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. Prepara o payload EXATO que o seu usuarioService do backend exige:
      const payload = {
        nome: formData.nome?.trim(),
        email: formData.email?.trim().toLowerCase(),
        senha: formData.senha,
        // Traduz caso o select envie "Funcionário" / "Administrador" com acento
        nivel: formData.nivel?.toLowerCase().includes('admin') ? 'admin' : 'funcionario',
      };

      // 2. Dispara a requisição para a API
      await api.post('/usuarios', payload);

      alert('Usuário cadastrado com sucesso!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (err) {
      console.error('Erro retornado pela API:', err.response?.data);

      // 3. Captura a mensagem REAL do backend (em vez da mensagem fixa antiga)
      const mensagemReal = err.response?.data?.mensagem 
        || err.response?.data?.message 
        || err.response?.data?.error
        || 'Erro de comunicação com o servidor.';

      setErro(mensagemReal);
      alert(`Falha no cadastro: ${mensagemReal}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {erro && <div style={{ color: 'red', marginBottom: '10px' }}>{erro}</div>}
      
      {/* Exemplo de Select ajustado para o campo 'nivel' */}
      <div>
        <label>Nível de Acesso *</label>
        <select 
          name="nivel" 
          value={formData.nivel} 
          onChange={handleChange}
        >
          <option value="funcionario">Funcionário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {/* Seus outros campos (Nome, E-mail, Senha) seguem normalmente */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Usuário'}
      </button>
    </form>
  );
}