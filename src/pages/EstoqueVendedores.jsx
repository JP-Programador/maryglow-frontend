import React, { useState, useEffect } from 'react';
import api, { mensagemErro } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EstoqueVendedores() {
  const { ehAdmin } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [mapa, setMapa] = useState({});
  const [vendedores, setVendedores] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [produtoId, setProdutoId] = useState('');
  const [de, setDe] = useState('geral');
  const [para, setPara] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const [p, e, t] = await Promise.all([
        api.get('/produtos'),
        api.get('/estoque'),
        api.get('/estoque/transferencias')
      ]);
      setProdutos(p.data.produtos);
      setMapa(e.data.estoque);
      setVendedores(e.data.vendedores);
      setTransferencias(t.data.transferencias);
    } catch (error) {
      alert(mensagemErro(error));
    } finally {
      setLoading(false);
    }
  };

  const saldo = (id, origem) => {
    const e = mapa[id];
    if (!e) return 0;
    return origem === 'geral' ? e.geral : (e.vendedores[origem] || 0);
  };

  const handleTransferir = async (e) => {
    e.preventDefault();
    if (!produtoId || !para) {
      alert('Escolha o produto e o destino.');
      return;
    }
    try {
      setSalvando(true);
      await api.post('/estoque/transferencias', {
        produto_id: Number(produtoId),
        de,
        para,
        quantidade: Number(quantidade)
      });
      setQuantidade(1);
      await carregar();
    } catch (error) {
      alert(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  const termo = busca.trim().toLowerCase();
  const visiveis = produtos.filter(
    (p) => !termo || p.nome.toLowerCase().includes(termo) || (p.sku || '').toLowerCase().includes(termo)
  );

  if (loading) return <LoadingSpinner />;

  const opcoesOrigem = (
    <>
      <option value="geral">Estoque geral</option>
      {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
    </>
  );

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Estoque por vendedor</h2>

      {ehAdmin && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="mb-3">Transferir estoque</h5>
            <form onSubmit={handleTransferir} className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label className="form-label">Produto</label>
                <select className="form-select" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="col-lg-2 col-6">
                <label className="form-label">De</label>
                <select className="form-select" value={de} onChange={(e) => setDe(e.target.value)}>{opcoesOrigem}</select>
                {produtoId && <small className="text-muted">Disponível: {saldo(produtoId, de)}</small>}
              </div>
              <div className="col-lg-2 col-6">
                <label className="form-label">Para</label>
                <select className="form-select" value={para} onChange={(e) => setPara(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {opcoesOrigem}
                </select>
              </div>
              <div className="col-lg-2 col-6">
                <label className="form-label">Quantidade</label>
                <input type="number" min="1" className="form-control" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
              </div>
              <div className="col-lg-2 col-6">
                <button type="submit" className="btn btn-primary w-100" disabled={salvando}>
                  {salvando ? 'Transferindo...' : 'Transferir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="m-0">Saldo por estoque</h5>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Buscar produto ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Produto</th>
                <th className="text-center">Geral</th>
                {vendedores.map((v) => <th key={v.id} className="text-center">{v.nome}</th>)}
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => {
                const e = mapa[p.id] || { geral: 0, total: 0, vendedores: {} };
                return (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="fw-semibold">{p.nome}</div>
                      <small className="text-muted">{p.sku || '-'}</small>
                    </td>
                    <td className="text-center">{e.geral}</td>
                    {vendedores.map((v) => <td key={v.id} className="text-center">{e.vendedores[v.id] || 0}</td>)}
                    <td className="text-center fw-bold">{e.total}</td>
                  </tr>
                );
              })}
              {visiveis.length === 0 && (
                <tr><td colSpan={3 + vendedores.length} className="text-center py-4 text-muted">Nenhum produto.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white"><h5 className="m-0">Últimas transferências</h5></div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Data</th>
                <th>Produto</th>
                <th>De</th>
                <th>Para</th>
                <th className="text-center">Qtd</th>
                <th>Feito por</th>
              </tr>
            </thead>
            <tbody>
              {transferencias.map((t) => (
                <tr key={t.id}>
                  <td className="ps-4">{new Date(t.criado_em).toLocaleString('pt-BR')}</td>
                  <td>{t.produto_nome}</td>
                  <td>{t.de_nome || 'Estoque geral'}</td>
                  <td>{t.para_nome || 'Estoque geral'}</td>
                  <td className="text-center">{t.quantidade}</td>
                  <td>{t.feito_por_nome || '-'}</td>
                </tr>
              ))}
              {transferencias.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma transferência ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
