import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FaPlus, FaSearch, FaEye } from 'react-icons/fa';

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarCompras();
  }, []);

  const carregarCompras = async () => {
    try {
      setLoading(true);
      const response = await api.get('/compras');
      setCompras(response.data);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      alert('Erro ao carregar o histórico de compras.');
    } finally {
      setLoading(false);
    }
  };

  const comprasFiltradas = compras.filter(c => 
    (c.fornecedor_nome && c.fornecedor_nome.toLowerCase().includes(busca.toLowerCase())) ||
    c.id.toString().includes(busca)
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Histórico de Compras</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/compras/nova')}>
          <FaPlus /> Nova Compra
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Buscar por ID ou Fornecedor..." 
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
                    <th>Fornecedor</th>
                    <th>Qtd. Itens</th>
                    <th>Valor Total</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasFiltradas.length > 0 ? (
                    comprasFiltradas.map(compra => (
                      <tr key={compra.id}>
                        <td className="fw-bold">#{compra.id}</td>
                        <td>{formatDate(compra.data_compra || compra.created_at)}</td>
                        <td>{compra.fornecedor_nome || 'Fornecedor Excluído'}</td>
                        <td>{compra.total_itens || '-'}</td>
                        <td className="text-success fw-bold">{formatCurrency(compra.valor_total)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary" title="Ver Detalhes">
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">Nenhuma compra registrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}