import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import ProdutoForm from '../components/produtos/ProdutoForm';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Listas de apoio para o formulário e filtros
  const [listas, setListas] = useState({ marcas: [], categorias: [], fornecedores: [] });
  
  // Estados dos Filtros
  const [busca, setBusca] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const [filtroEstoque, setFiltroEstoque] = useState(''); // 'baixo' | 'zerado' | 'normal'
  
  // Controle do Modal
  const [showModal, setShowModal] = useState(false);
  const [produtoEditado, setProdutoEditado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resProdutos, resMarcas, resCategorias, resFornecedores] = await Promise.all([
        api.get('/produtos'),
        api.get('/marcas'),
        api.get('/categorias'),
        api.get('/fornecedores')
      ]);
      
      setProdutos(resProdutos.data.produtos);
      setListas({
        marcas: resMarcas.data.registros,
        categorias: resCategorias.data.registros,
        fornecedores: resFornecedores.data.fornecedores
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar produtos. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dadosProduto, novasFotos = [], fotosRemovidas = []) => {
    try {
      const form = new FormData();
      Object.entries(dadosProduto).forEach(([chave, valor]) => {
        if (chave === 'imagens' || valor === null || valor === undefined) return;
        form.append(chave, valor);
      });
      novasFotos.forEach((arquivo) => form.append('imagens', arquivo));
      form.append('remover_imagens', JSON.stringify(fotosRemovidas));
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (produtoEditado) {
        await api.put(`/produtos/${produtoEditado.id}`, form, config);
      } else {
        await api.post('/produtos', form, config);
      }
      setShowModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(error.response?.data?.mensagem || 'Erro ao salvar produto. Verifique os dados e tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Não foi possível excluir o produto. Ele pode estar vinculado a uma venda.');
      }
    }
  };

  const abrirModal = (produto = null) => {
    setProdutoEditado(produto);
    setShowModal(true);
  };

  // Lógica de Filtros Avançados
  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(busca.toLowerCase()));
    const matchMarca = filtroMarca ? p.marca_id?.toString() === filtroMarca : true;
    const matchCategoria = filtroCategoria ? p.categoria_id?.toString() === filtroCategoria : true;
    const matchFornecedor = filtroFornecedor ? p.fornecedor_id?.toString() === filtroFornecedor : true;
    
    let matchEstoque = true;
    if (filtroEstoque === 'baixo') matchEstoque = p.estoque_atual > 0 && p.estoque_atual <= 5;
    if (filtroEstoque === 'zerado') matchEstoque = p.estoque_atual === 0;
    if (filtroEstoque === 'normal') matchEstoque = p.estoque_atual > 5;

    return matchBusca && matchMarca && matchCategoria && matchFornecedor && matchEstoque;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Produtos</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => abrirModal()}>
          <FaPlus /> Novo Produto
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          {/* Sessão de Filtros */}
          <div className="row g-2 mb-4">
            <div className="col-md-12 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Buscar por nome ou SKU..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 col-lg-2">
              <select className="form-select" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}>
                <option value="">Todas as Marcas</option>
                {listas.marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <select className="form-select" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="">Todas as Categorias</option>
                {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <select className="form-select" value={filtroFornecedor} onChange={(e) => setFiltroFornecedor(e.target.value)}>
                <option value="">Todos Fornecedores</option>
                {listas.fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div className="col-md-6 col-lg-2">
              <select className="form-select" value={filtroEstoque} onChange={(e) => setFiltroEstoque(e.target.value)}>
                <option value="">Status do Estoque</option>
                <option value="normal">Estoque Normal (&gt; 5)</option>
                <option value="baixo">Estoque Baixo (1 a 5)</option>
                <option value="zerado">Sem Estoque (0)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando produtos...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>SKU</th>
                    <th>Nome</th>
                    <th>Estoque</th>
                    <th>Preço Venda</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map(produto => (
                      <tr key={produto.id}>
                        <td>{produto.sku || '-'}</td>
                        <td>
                          <div className="fw-bold">{produto.nome}</div>
                          <small className="text-muted">{produto.cor} {produto.tom ? `(${produto.tom})` : ''}</small>
                        </td>
                        <td>
                          <span className={`badge ${produto.estoque_atual === 0 ? 'bg-danger' : produto.estoque_atual <= 5 ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {produto.estoque_atual} un.
                          </span>
                        </td>
                        <td>{formatCurrency(produto.preco_venda)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirModal(produto)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(produto.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        <FaFilter size={30} className="mb-2 opacity-50" /><br/>
                        Nenhum produto atende aos filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProdutoForm 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSalvar} 
        produtoEditado={produtoEditado}
        listas={listas}
      />
    </div>
  );
}