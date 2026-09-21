import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield, FaUser, FaKey } from 'react-icons/fa';
import UsuarioForm from '../components/usuarios/UsuarioForm';
import ResetSenhaModal from '../components/usuarios/ResetSenhaModal';
import { useAuth } from '../context/AuthContext';

export default function Usuarios() {
  const { usuario: logado } = useAuth();
  const [usuarioSenha, setUsuarioSenha] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro de permissão ou conexão ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dados) => {
    try {
      // Limpa a senha do payload se ela estiver vazia durante a edição
      const payload = { ...dados };
      if (usuarioEditado && !payload.senha) {
        delete payload.senha;
      }

      if (usuarioEditado) {
        const novaSenha = dados.senha;
        delete payload.senha;
        await api.put(`/usuarios/${usuarioEditado.id}`, payload);
        if (novaSenha) {
          await api.put(`/usuarios/${usuarioEditado.id}/senha`, { senha: novaSenha });
        }
      } else {
        await api.post('/usuarios', payload);
      }
      
      setShowModal(false);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert(error.response?.data?.mensagem || 'Erro ao salvar. Verifique se o e-mail já está em uso.');
    }
  };

  const handleExcluir = async (usuario) => {
    const tipo = usuario.nivel === 'admin' ? ' (ADMINISTRADOR)' : '';
    if (window.confirm(`Excluir o login de ${usuario.nome}${tipo}? O acesso é removido na hora e isso não pode ser desfeito.`)) {
      try {
        await api.delete(`/usuarios/${usuario.id}`);
        carregarUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert(error.response?.data?.mensagem || 'Não foi possível excluir o usuário.');
      }
    }
  };

  const handleRedefinirSenha = async (usuario, senha) => {
    try {
      await api.put(`/usuarios/${usuario.id}/senha`, { senha });
      setUsuarioSenha(null);
      alert(`Senha de ${usuario.nome} redefinida com sucesso.`);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      alert(error.response?.data?.mensagem || 'Não foi possível redefinir a senha.');
    }
  };

  const abrirModal = (usuario = null) => {
    setUsuarioEditado(usuario);
    setShowModal(true);
  };

  const filtrados = usuarios.filter(u => 
    (u.nome && u.nome.toLowerCase().includes(busca.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Usuários</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Novo Usuário
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Buscar por nome ou e-mail..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Acesso</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length > 0 ? (
                    filtrados.map(usuario => (
                      <tr key={usuario.id}>
                        <td className="fw-bold">
                          {usuario.nome}
                          {logado?.id === usuario.id && <span className="badge bg-secondary ms-2">Você</span>}
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          {!usuario.ativo && <span className="badge bg-dark me-1">Inativo</span>}
                          {usuario.nivel === 'admin' ? (
                            <span className="badge bg-danger d-inline-flex align-items-center gap-1">
                              <FaUserShield /> Admin
                            </span>
                          ) : (
                            <span className="badge bg-info text-dark d-inline-flex align-items-center gap-1">
                              <FaUser /> Funcionário
                            </span>
                          )}
                        </td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-secondary me-2" title="Editar" aria-label={`Editar ${usuario.nome}`} onClick={() => abrirModal(usuario)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-warning me-2" title="Redefinir senha" aria-label={`Redefinir senha de ${usuario.nome}`} onClick={() => setUsuarioSenha(usuario)}>
                            <FaKey />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title={logado?.id === usuario.id ? 'Você não pode excluir o próprio login' : 'Excluir login'}
                            aria-label={`Excluir ${usuario.nome}`}
                            disabled={logado?.id === usuario.id}
                            onClick={() => handleExcluir(usuario)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ResetSenhaModal
        usuario={usuarioSenha}
        onClose={() => setUsuarioSenha(null)}
        onConfirm={handleRedefinirSenha}
      />

      <UsuarioForm 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSalvar} 
        usuarioEditado={usuarioEditado}
      />
    </div>
  );
}