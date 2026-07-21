import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaFilter, FaBox, FaChartLine, FaFileDownload, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  
  // Filtros de Data
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Dados
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosCompras, setDadosCompras] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);
  const [produtosSemMovimentacao, setProdutosSemMovimentacao] = useState([]);
  const [resumo, setResumo] = useState({ totalVendido: 0, lucroTotal: 0, qtdVendas: 0 });

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      const params = { dataInicio, dataFim };
      
      const response = await api.get('/relatorios', { params });
      const data = response.data;
      
      setDadosVendas(data.vendas_por_dia || []);
      setDadosCompras(data.compras_por_dia || []);
      setTopProdutos(data.produtos_mais_vendidos || []);
      setProdutosSemMovimentacao(data.produtos_sem_movimentacao || []);
      setResumo({
        totalVendido: data.total_vendido || 0,
        lucroTotal: data.lucro_total || 0,
        qtdVendas: data.quantidade_vendas || 0
      });
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      montarDadosMock(); 
    } finally {
      setLoading(false);
    }
  };

  const montarDadosMock = () => {
    setDadosVendas([
      { data: '01/07', vendas: 4000, lucro: 2400 }, { data: '05/07', vendas: 3000, lucro: 1398 },
      { data: '10/07', vendas: 2000, lucro: 9800 }, { data: '15/07', vendas: 2780, lucro: 3908 },
      { data: '20/07', vendas: 1890, lucro: 4800 }, { data: '25/07', vendas: 2390, lucro: 3800 },
    ]);
    setDadosCompras([
      { data: '02/07', valor: 2000 }, { data: '08/07', valor: 1500 },
      { data: '14/07', valor: 5000 }, { data: '22/07', valor: 1200 },
    ]);
    setTopProdutos([
      { nome: 'Base Líquida', qtd: 120 }, { nome: 'Batom Matte', qtd: 98 },
      { nome: 'Sombra Glow', qtd: 86 }, { nome: 'Delineador', qtd: 65 },
    ]);
    setProdutosSemMovimentacao([
      { id: 14, sku: 'PAL-001', nome: 'Paleta de Cores Antiga', estoque: 15, dias_parado: 45 },
      { id: 22, sku: 'PIN-004', nome: 'Pincel Chanfrado', estoque: 30, dias_parado: 60 },
      { id: 31, sku: 'GLO-009', nome: 'Gloss Translúcido', estoque: 8, dias_parado: 90 },
    ]);
    setResumo({ totalVendido: 16060, lucroTotal: 26086, qtdVendas: 45 });
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregarRelatorios();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard de Relatórios</h2>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
          <FaFileDownload /> Exportar PDF
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body py-3">
          <form onSubmit={handleFiltrar} className="d-flex align-items-end gap-3">
            <div>
              <label className="form-label text-muted small mb-1">Data Inicial</label>
              <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <label className="form-label text-muted small mb-1">Data Final</label>
              <input type="date" className="form-control" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
              <FaFilter /> Filtrar Período
            </button>
          </form>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm border-start border-primary border-4">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-1">Faturamento no Período</h6>
              <h3 className="fw-bold m-0 text-dark">{formatCurrency(resumo.totalVendido)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm border-start border-success border-4">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-1">Lucro Bruto</h6>
              <h3 className="fw-bold m-0 text-success">{formatCurrency(resumo.lucroTotal)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm border-start border-info border-4">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-1">Pedidos Realizados</h6>
              <h3 className="fw-bold m-0 text-dark">{resumo.qtdVendas}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 1: Gráficos de Vendas e Top Produtos */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white pt-3 pb-2 border-0">
              <h5 className="m-0 d-flex align-items-center gap-2">
                <FaChartLine className="text-primary" /> Curva de Vendas vs Lucro
              </h5>
            </div>
            <div className="card-body" style={{ minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosVendas} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="data" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" name="Vendas (R$)" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="lucro" name="Lucro (R$)" stroke="#82ca9d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white pt-3 pb-2 border-0">
              <h5 className="m-0 d-flex align-items-center gap-2">
                <FaBox className="text-warning" /> Top Mais Vendidos
              </h5>
            </div>
            <div className="card-body" style={{ minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProdutos} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="qtd" name="Unid. Vendidas" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Compras por Período e Produtos Sem Movimentação */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white pt-3 pb-2 border-0">
              <h5 className="m-0 d-flex align-items-center gap-2">
                <FaShoppingCart className="text-info" /> Compras (Entrada de Estoque)
              </h5>
            </div>
            <div className="card-body" style={{ minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosCompras} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="data" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="valor" name="Valor Gasto (R$)" fill="#0dcaf0" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white pt-3 pb-2 border-0 d-flex justify-content-between align-items-center">
              <h5 className="m-0 d-flex align-items-center gap-2 text-danger">
                <FaHistory /> Produtos Sem Movimentação
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Produto</th>
                      <th>Estoque Atual</th>
                      <th className="pe-4 text-end">Dias Parado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosSemMovimentacao.length > 0 ? (
                      produtosSemMovimentacao.map(item => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="fw-bold">{item.nome}</div>
                            <small className="text-muted">SKU: {item.sku || '-'}</small>
                          </td>
                          <td>{item.estoque} un.</td>
                          <td className="pe-4 text-end">
                            <span className="badge bg-danger rounded-pill px-3 py-2">
                              {item.dias_parado} dias
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">
                          Nenhum produto com estoque parado. Ótimo trabalho!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}