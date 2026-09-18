import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FaPlus, FaSearch, FaEye, FaShoppingBag, FaTrash } from 'react-icons/fa';
import VendaDetalheModal from '../components/vendas/VendaDetalheModal';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [vendaDetalhe, setVendaDetalhe] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendas');
      setVendas(response.data.vendas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      alert('Erro ao carregar o histórico de vendas.');
    } finally {
      setLoading(false);
    }
  };

  const visualizarVenda = async (id) => {
    setShowModal(true);
    setCarregandoDetalhe(true);
    setVendaDetalhe(null);
    try {
      const response = await api.get(`/vendas/${id}`);
      setVendaDetalhe(response.data.venda);
    } catch (error) {
      console.error('Erro ao carregar detalhes da venda:', error);
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  const excluirVenda = async (venda) => {
    if (window.confirm(`Cancelar a venda #${venda.id}? O estoque dos itens será devolvido.`)) {
      try {
        await api.delete(`/vendas/${venda.id}`);
        carregarVendas();
      } catch (error) {
        console.error('Erro ao cancelar venda:', error);
        alert('Não foi possível cancelar esta venda.');
      }
    }
  };

  const vendasFiltradas = vendas.filter(v =>
    (v.plataforma && v.plataforma.toLowerCase().includes(busca.toLowerCase())) ||
    v.id.toString().includes(busca)
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Histórico de Vendas</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/vendas/nova')}>
          <FaPlus /> Nova Venda (PDV)
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Buscar por ID ou Plataforma..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando histórico...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Plataforma</th>
                    <th>Pagamento</th>
                    <th>Total Itens</th>
                    <th>Valor Total</th>
                    <th>Lucro</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradas.length > 0 ? (
                    vendasFiltradas.map(venda => (
                      <tr key={venda.id}>
                        <td className="fw-bold">#{venda.id}</td>
                        <td>{formatDate(venda.data_venda || venda.created_at)}</td>
                        <td>
                          <span className="badge bg-secondary">{venda.plataforma}</span>
                        </td>
                        <td>{venda.forma_pagamento}</td>
                        <td>{venda.total_itens || '-'}</td>
                        <td className="fw-bold">{formatCurrency(venda.valor_total)}</td>
                        <td className="text-success fw-bold">
                          {/* O backend deve retornar lucro_total, mas caso não retorne, prevemos um fallback */}
                          {venda.lucro_total ? formatCurrency(venda.lucro_total) : '-'}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" title="Ver Detalhes" onClick={() => visualizarVenda(venda.id)}>
                            <FaEye />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Cancelar Venda" onClick={() => excluirVenda(venda)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <FaShoppingBag size={40} className="mb-3 text-light" /><br/>
                        Nenhuma venda registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <VendaDetalheModal
        show={showModal}
        onClose={() => setShowModal(false)}
        venda={vendaDetalhe}
        carregando={carregandoDetalhe}
      />
    </div>
  );
}