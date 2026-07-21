import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

export default function CadastroSimples({ titulo, labelItem, endpoint }) {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [itemEditado, setItemEditado] = useState(null);
  const [nomeForm, setNomeForm] = useState('');

  useEffect(() => {
    carregarDados();
  }, [endpoint]); // Recarrega se o endpoint mudar

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setItens(response.data.registros);
    } catch (error) {
      console.error(`Erro ao carregar ${titulo}:`, error);
      alert(`Erro ao carregar ${labelItem}s. Verifique sua conexão.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      if (itemEditado) {
        await api.put(`${endpoint}/${itemEditado.id}`, { nome: nomeForm });
      } else {
        await api.post(endpoint, { nome: nomeForm });
      }
      setShowModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Verifique se este nome já não está cadastrado.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm(`Tem certeza que deseja excluir esta ${labelItem}?`)) {
      try {
        await api.delete(`${endpoint}/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert(`Não foi possível excluir. Provavelmente existem produtos vinculados a esta ${labelItem}.`);
      }
    }
  };

  const abrirModal = (item = null) => {
    setItemEditado(item);
    setNomeForm(item ? item.nome : '');
    setShowModal(true);
  };

  const filtrados = itens.filter(item => 
    item.nome && item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{titulo}</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Nova {labelItem}
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder={`Buscar ${labelItem.toLowerCase()}...`} 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nome da {labelItem}</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length > 0 ? (
                    filtrados.map(item => (
                      <tr key={item.id}>
                        <td className="text-muted">#{item.id}</td>
                        <td className="fw-bold">{item.nome}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirModal(item)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(item.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-3">Nenhuma {labelItem.toLowerCase()} encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Embutido */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSalvar}>
                <div className="modal-header">
                  <h5 className="modal-title">{itemEditado ? `Editar ${labelItem}` : `Nova ${labelItem}`}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={nomeForm} 
                      onChange={(e) => setNomeForm(e.target.value)} 
                      required 
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}