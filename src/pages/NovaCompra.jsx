import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaTrash, FaCheck, FaArrowLeft } from 'react-icons/fa';

export default function NovaCompra() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  // Estado da Compra
  const [fornecedorId, setFornecedorId] = useState('');
  const [itensCompra, setItensCompra] = useState([]);
  
  // Estado do Formulário de Inserção de Item
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [custoUnitario, setCustoUnitario] = useState('');

  useEffect(() => {
    carregarListas();
  }, []);

  const carregarListas = async () => {
    try {
      const [resFornecedores, resProdutos] = await Promise.all([
        api.get('/fornecedores'),
        api.get('/produtos')
      ]);
      setFornecedores(resFornecedores.data);
      setProdutos(resProdutos.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar fornecedores e produtos.');
    }
  };

  // Quando escolhe um produto, preenche o preço de custo automaticamente
  const handleProdutoChange = (e) => {
    const prodId = e.target.value;
    setProdutoSelecionado(prodId);
    
    if (prodId) {
      const prod = produtos.find(p => p.id.toString() === prodId);
      if (prod) setCustoUnitario(prod.preco_custo);
    } else {
      setCustoUnitario('');
    }
  };

  const handleAdicionarItem = (e) => {
    e.preventDefault();
    if (!produtoSelecionado || quantidade <= 0 || custoUnitario < 0) {
      alert('Preencha corretamente os dados do produto.');
      return;
    }

    const prod = produtos.find(p => p.id.toString() === produtoSelecionado);
    
    // Verifica se o item já está na lista para apenas somar a quantidade
    const indexExistente = itensCompra.findIndex(item => item.produto_id === prod.id);
    
    if (indexExistente >= 0) {
      const novosItens = [...itensCompra];
      novosItens[indexExistente].quantidade += Number(quantidade);
      novosItens[indexExistente].subtotal = novosItens[indexExistente].quantidade * novosItens[indexExistente].preco_unitario;
      setItensCompra(novosItens);
    } else {
      const novoItem = {
        produto_id: prod.id,
        nome: prod.nome,
        sku: prod.sku,
        quantidade: Number(quantidade),
        preco_unitario: Number(custoUnitario),
        subtotal: Number(quantidade) * Number(custoUnitario)
      };
      setItensCompra([...itensCompra, novoItem]);
    }

    // Resetar campos do formulário de item
    setProdutoSelecionado('');
    setQuantidade(1);
    setCustoUnitario('');
  };

  const handleRemoverItem = (index) => {
    const novosItens = [...itensCompra];
    novosItens.splice(index, 1);
    setItensCompra(novosItens);
  };

  const valorTotalCompra = itensCompra.reduce((acc, item) => acc + item.subtotal, 0);

  const handleFinalizarCompra = async () => {
    if (!fornecedorId) {
      alert('Selecione um fornecedor.');
      return;
    }
    if (itensCompra.length === 0) {
      alert('Adicione pelo menos um produto à compra.');
      return;
    }

    try {
      const payload = {
        fornecedor_id: fornecedorId,
        valor_total: valorTotalCompra,
        itens: itensCompra.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      };

      await api.post('/compras', payload);
      alert('Compra registrada e estoque atualizado com sucesso!');
      navigate('/compras');
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('Erro ao processar a compra. Verifique os dados.');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/compras')}>
            <FaArrowLeft /> Voltar
          </button>
          <h2 className="m-0">Nova Compra (Entrada de Estoque)</h2>
        </div>
        <button 
          className="btn btn-success d-flex align-items-center gap-2 px-4" 
          onClick={handleFinalizarCompra}
          disabled={itensCompra.length === 0 || !fornecedorId}
        >
          <FaCheck /> Finalizar Compra
        </button>
      </div>

      <div className="row">
        {/* Lado Esquerdo: Formulários */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white">
              <h5 className="m-0">1. Dados do Fornecedor</h5>
            </div>
            <div className="card-body">
              <label className="form-label">Fornecedor *</label>
              <select 
                className="form-select" 
                value={fornecedorId} 
                onChange={(e) => setFornecedorId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="m-0">2. Adicionar Produto</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAdicionarItem}>
                <div className="mb-3">
                  <label className="form-label">Produto *</label>
                  <select 
                    className="form-select" 
                    value={produtoSelecionado} 
                    onChange={handleProdutoChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Quantidade</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1" 
                      value={quantidade} 
                      onChange={(e) => setQuantidade(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Custo Unitário</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control" 
                      value={custoUnitario} 
                      onChange={(e) => setCustoUnitario(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Adicionar à Lista
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lado Direito: Lista de Itens */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="m-0">Resumo da Compra</h5>
              <h4 className="m-0 text-success fw-bold">{formatCurrency(valorTotalCompra)}</h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Produto</th>
                      <th>Qtd</th>
                      <th>Custo Unit.</th>
                      <th>Subtotal</th>
                      <th className="text-end pe-4">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensCompra.length > 0 ? (
                      itensCompra.map((item, index) => (
                        <tr key={index}>
                          <td className="ps-4">
                            <div className="fw-bold">{item.nome}</div>
                            <small className="text-muted">SKU: {item.sku || '-'}</small>
                          </td>
                          <td>{item.quantidade}</td>
                          <td>{formatCurrency(item.preco_unitario)}</td>
                          <td className="fw-bold">{formatCurrency(item.subtotal)}</td>
                          <td className="text-end pe-4">
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleRemoverItem(index)}
                              title="Remover"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          Nenhum produto adicionado ainda.<br/>
                          Selecione os produtos ao lado para montar a compra.
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