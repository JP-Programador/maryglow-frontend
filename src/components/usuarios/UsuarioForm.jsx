import React, { useState } from 'react';
import api from '../../services/api';

export default function UsuarioForm({ onSuccess, onClose, usuarioParaEditar }) {
  const [formData, setFormData] = useState({
    nome: usuarioParaEditar?.nome || '',
    email: usuarioParaEditar?.email || '',
    senha: '',
    nivel: usuarioParaEditar?.nivel || 'funcionario',
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
      // Formata o payload exatamente no padrão do backend
      const payload = {
        nome: formData.nome?.trim(),
        email: formData.email?.trim().toLowerCase(),
        senha: formData.senha,
        nivel: formData.nivel === 'admin' ? 'admin' : 'funcionario',
      };

      if (usuarioParaEditar?.id) {
        // Atualização de usuário
        await api.put(`/usuarios/${usuarioParaEditar.id}`, payload);
      } else {
        // Criação de novo usuário
        await api.post('/usuarios', payload);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Erro na API:', err.response?.data);

      // Pega a mensagem real enviada pelo backend
      const msgReal =
        err.response?.data?.mensagem ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erro ao salvar usuário. Verifique os dados.';

      setErro(msgReal);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{usuarioParaEditar ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {erro && <div className="alert alert-danger">{erro}</div>}

          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="form-control"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Senha {usuarioParaEditar ? '(deixe em branco para não alterar)' : '*'}
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="form-control"
              value={formData.senha}
              onChange={handleChange}
              required={!usuarioParaEditar}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nivel">Nível de Acesso *</label>
            <select
              id="nivel"
              name="nivel"
              className="form-control"
              value={formData.nivel}
              onChange={handleChange}
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}