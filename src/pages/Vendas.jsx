import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate, STATUS_PAGAMENTO_LABEL } from '../utils/format';
import { FaPlus, FaSearch, FaEye, FaShoppingBag, FaTrash, FaBoxOpen, FaCheck, FaClock } from 'react-icons/fa';
import VendaDetalheModal from '../components/vendas/VendaDetalheModal';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const requisicaoAtual = useRef(0);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [vendaDetalhe, setVendaDetalhe] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  // Busca por produto no servidor, com pequena espera enquanto a pessoa digita
  useEffect(() => {
    const timer = setTimeout(() => carregarVendas(), produtoBusca ? 350 : 0);
    return () => clearTimeout(timer);
  }, [produtoBusca, filtroStatus]);

  const carregarVendas = async () => {
    const numero = ++requisicaoAtual.current;
    const produto = produtoBusca.trim();
    try {
      setLoading(true);
      const params = {};
      if (produto) params.produto = produto;
      if (filtroStatus) params.status_pagamento = filtroStatus;
      const response = await api.get('/vendas', { params });
      if (numero === requisicaoAtual.current) setVendas(response.data.vendas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      alert('Erro ao carregar o histórico de vendas.');
    } finally {
      if (numero === requisicaoAtual.current) setLoading(false);
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

  const alterarPagamento = async (venda) => {
    const novo = venda.status_pagamento === 'pendente' ? 'pago' : 'pendente';
    const pergunta = novo === 'pago'
      ? `Marcar a venda #${venda.id} como PAGA?`
      : `Voltar a venda #${venda.id} para PENDENTE?`;
    if (!window.confirm(pergunta)) return;
    try {
      await api.patch(`/vendas/${venda.id}/pagamento`, { status_pagamento: novo });
      carregarVendas();
    } catch (error) {
      console.error('Erro ao alterar pagamento:', error);
      alert('Não foi possível alterar a situação do pagamento.');
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
          <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="input-group" style={{ maxWidth: '320px' }}>
              <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por ID ou Plataforma..."
                aria-label="Buscar por ID ou plataforma"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ maxWidth: '200px' }}
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar por situação do pagamento"
            >
              <option value="">Todas as situações</option>
              <option value="pago">Pagas</option>
              <option value="pendente">Pendentes</option>
            </select>
            <div className="input-group" style={{ maxWidth: '360px' }}>
              <span className="input-group-text bg-white"><FaBoxOpen className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por produto (nome ou SKU)..."
                aria-label="Buscar vendas por produto"
                value={produtoBusca}
                onChange={(e) => setProdutoBusca(e.target.value)}
              />
              {produtoBusca && (
                <button type="button" className="btn btn-outline-secondary" onClick={() => setProdutoBusca('')} aria-label="Limpar busca por produto">
                  ✕
                </button>
              )}
            </div>
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
                    <th>Situação</th>
                    <th>Produtos</th>
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
                        <td>
                          <span className={`badge ${venda.status_pagamento === 'pendente' ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {STATUS_PAGAMENTO_LABEL[venda.status_pagamento] || 'Pago'}
                          </span>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '260px' }} title={venda.produtos_nomes || ''}>
                            {venda.produtos_nomes || '-'}
                          </div>
                        </td>
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
                          <button
                            className={`btn btn-sm me-2 ${venda.status_pagamento === 'pendente' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            title={venda.status_pagamento === 'pendente' ? 'Marcar como paga' : 'Voltar para pendente'}
                            aria-label={venda.status_pagamento === 'pendente' ? `Marcar venda ${venda.id} como paga` : `Voltar venda ${venda.id} para pendente`}
                            onClick={() => alterarPagamento(venda)}
                          >
                            {venda.status_pagamento === 'pendente' ? <FaCheck /> : <FaClock />}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Cancelar Venda" onClick={() => excluirVenda(venda)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-5 text-muted">
                        <FaShoppingBag size={40} className="mb-3 text-light" /><br/>
                        {produtoBusca.trim() || filtroStatus ? 'Nenhuma venda encontrada com esses filtros.' : 'Nenhuma venda registrada.'}
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