import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import FornecedorForm from '../components/fornecedores/FornecedorForm';

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [fornecedorEditado, setFornecedorEditado] = useState(null);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fornecedores');
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      alert('Erro ao carregar fornecedores. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dados) => {
    try {
      if (fornecedorEditado) {
        await api.put(`/fornecedores/${fornecedorEditado.id}`, dados);
      } else {
        await api.post('/fornecedores', dados);
      }
      setShowModal(false);
      carregarFornecedores();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar fornecedor. Verifique os dados e tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor? Ele pode estar vinculado a produtos ou compras.')) {
      try {
        await api.delete(`/fornecedores/${id}`);
        carregarFornecedores();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Não foi possível excluir. Provavelmente existem produtos vinculados a ele.');
      }
    }
  };

  const abrirModal = (fornecedor = null) => {
    setFornecedorEditado(fornecedor);
    setShowModal(true);
  };

  const filtrados = fornecedores.filter(f => 
    (f.razao_social && f.razao_social.toLowerCase().includes(busca.toLowerCase())) || 
    (f.nome_fantasia && f.nome_fantasia.toLowerCase().includes(busca.toLowerCase())) ||
    (f.cnpj && f.cnpj.includes(busca))
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Fornecedores</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Novo Fornecedor
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Buscar por nome ou CNPJ..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando fornecedores...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Empresa</th>
                    <th>CNPJ</th>
                    <th>Contato</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length > 0 ? (
                    filtrados.map(fornecedor => (
                      <tr key={fornecedor.id}>
                        <td>
                          <div className="fw-bold">{fornecedor.nome_fantasia || fornecedor.razao_social}</div>
                          {fornecedor.nome_fantasia && <small className="text-muted">{fornecedor.razao_social}</small>}
                        </td>
                        <td>{fornecedor.cnpj || '-'}</td>
                        <td>
                          <div>{fornecedor.telefone || '-'}</div>
                          <small className="text-muted">{fornecedor.email || ''}</small>
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirModal(fornecedor)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(fornecedor.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3">Nenhum fornecedor encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <FornecedorForm 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSalvar} 
        fornecedorEditado={fornecedorEditado}
      />
    </div>
  );
}