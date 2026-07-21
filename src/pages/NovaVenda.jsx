import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaTrash, FaCheck, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

export default function NovaVenda() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  
  // Estado da Venda
  const [plataforma, setPlataforma] = useState('loja_fisica');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [itensVenda, setItensVenda] = useState([]);
  
  // Estado do Formulário de Inserção
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoVenda, setPrecoVenda] = useState('');
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(0);

  // value = o que o backend espera (snake_case); label = o que aparece na tela
  const plataformas = [
    { value: 'loja_fisica', label: 'Loja Física' },
    { value: 'site', label: 'Site' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'shopee', label: 'Shopee' },
    { value: 'mercado_livre', label: 'Mercado Livre' },
    { value: 'tiktok_shop', label: 'TikTok Shop' },
  ];
  const formasPagamento = [
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'dinheiro', label: 'Dinheiro' },
  ];

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      // Trazemos os produtos para popular o select
      const response = await api.get('/produtos');
      setProdutos(response.data.produtos);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar lista de produtos.');
    }
  };

  const handleProdutoChange = (e) => {
    const prodId = e.target.value;
    setProdutoSelecionado(prodId);
    
    if (prodId) {
      const prod = produtos.find(p => p.id.toString() === prodId);
      if (prod) {
        setPrecoVenda(prod.preco_venda);
        setEstoqueDisponivel(prod.estoque);
        setQuantidade(1);
      }
    } else {
      setPrecoVenda('');
      setEstoqueDisponivel(0);
    }
  };

  const handleAdicionarItem = (e) => {
    e.preventDefault();
    if (!produtoSelecionado || quantidade <= 0 || precoVenda < 0) {
      alert('Preencha corretamente os dados do produto.');
      return;
    }

    const prod = produtos.find(p => p.id.toString() === produtoSelecionado);
    
    // Verifica a quantidade total que já está no carrinho para este produto
    const qtdJaNoCarrinho = itensVenda
      .filter(item => item.produto_id === prod.id)
      .reduce((acc, curr) => acc + curr.quantidade, 0);

    if (Number(quantidade) + qtdJaNoCarrinho > prod.estoque) {
      alert(`Estoque insuficiente! Você só tem ${prod.estoque} unidades disponíveis (e já adicionou ${qtdJaNoCarrinho} no carrinho).`);
      return;
    }

    const lucroUnitario = Number(precoVenda) - Number(prod.preco_custo);

    const novoItem = {
      produto_id: prod.id,
      nome: prod.nome,
      sku: prod.sku,
      quantidade: Number(quantidade),
      preco_unitario: Number(precoVenda),
      preco_custo: Number(prod.preco_custo), // Guardamos para cálculo visual de lucro
      subtotal: Number(quantidade) * Number(precoVenda),
      lucro_subtotal: Number(quantidade) * lucroUnitario
    };

    setItensVenda([...itensVenda, novoItem]);
    
    // Resetar formulário de item
    setProdutoSelecionado('');
    setQuantidade(1);
    setPrecoVenda('');
    setEstoqueDisponivel(0);
  };

  const handleRemoverItem = (index) => {
    const novosItens = [...itensVenda];
    novosItens.splice(index, 1);
    setItensVenda(novosItens);
  };

  const valorTotalVenda = itensVenda.reduce((acc, item) => acc + item.subtotal, 0);
  const lucroEstimado = itensVenda.reduce((acc, item) => acc + item.lucro_subtotal, 0);

  const handleFinalizarVenda = async () => {
    if (itensVenda.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.');
      return;
    }

    try {
      const payload = {
        plataforma,
        forma_pagamento: formaPagamento,
        valor_total: valorTotalVenda,
        itens: itensVenda.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      };

      await api.post('/vendas', payload);
      alert('Venda finalizada com sucesso! O estoque foi baixado.');
      navigate('/vendas');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao processar a venda. Verifique se há estoque suficiente no backend.');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/vendas')}>
            <FaArrowLeft /> Voltar
          </button>
          <h2 className="m-0">Ponto de Venda (PDV)</h2>
        </div>
        <button 
          className="btn btn-success d-flex align-items-center gap-2 px-4 py-2 fs-5" 
          onClick={handleFinalizarVenda}
          disabled={itensVenda.length === 0}
        >
          <FaCheck /> Fechar Venda
        </button>
      </div>

      <div className="row">
        {/* Lado Esquerdo: Formulários e Dados da Venda */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body">
              <h5 className="mb-3">1. Dados da Venda</h5>
              <div className="mb-3">
                <label className="form-label">Plataforma de Venda *</label>
                <select className="form-select" value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
                  {plataformas.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label">Forma de Pagamento *</label>
                <select className="form-select" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                  {formasPagamento.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 border-top border-primary border-3">
            <div className="card-body">
              <h5 className="mb-3">2. Adicionar Produto</h5>
              <form onSubmit={handleAdicionarItem}>
                <div className="mb-3">
                  <label className="form-label">Produto *</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={produtoSelecionado} 
                    onChange={handleProdutoChange}
                    required
                  >
                    <option value="">Buscar produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                        {p.sku ? `[${p.sku}] ` : ''}{p.nome} {p.estoque <= 0 ? '(Sem Estoque)' : ''}
                      </option>
                    ))}
                  </select>
                  {produtoSelecionado && (
                    <small className={`mt-1 d-block ${estoqueDisponivel <= 5 ? 'text-danger fw-bold' : 'text-muted'}`}>
                      Estoque disponível: {estoqueDisponivel} un.
                    </small>
                  )}
                </div>
                
                <div className="row mb-4">
                  <div className="col-5">
                    <label className="form-label">Quantidade</label>
                    <input 
                      type="number" 
                      className="form-control form-control-lg text-center" 
                      min="1" 
                      max={estoqueDisponivel || 1}
                      value={quantidade} 
                      onChange={(e) => setQuantidade(e.target.value)} 
                      required 
                      disabled={!produtoSelecionado}
                    />
                  </div>
                  <div className="col-7">
                    <label className="form-label">Preço Unit. (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control form-control-lg text-end" 
                      value={precoVenda} 
                      onChange={(e) => setPrecoVenda(e.target.value)} 
                      required 
                      disabled={!produtoSelecionado}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2" disabled={!produtoSelecionado}>
                  <FaShoppingCart /> Adicionar ao Carrinho
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lado Direito: Cupom Fiscal / Lista de Itens */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white p-4">
              <h5 className="m-0 text-muted">CARRINHO DE COMPRAS</h5>
            </div>
            
            <div className="card-body p-0" style={{ minHeight: '300px' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Item</th>
                      <th>Qtd</th>
                      <th>Unitário</th>
                      <th>Subtotal</th>
                      <th className="text-end pe-4">Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensVenda.length > 0 ? (
                      itensVenda.map((item, index) => (
                        <tr key={index}>
                          <td className="ps-4">
                            <div className="fw-bold fs-6">{item.nome}</div>
                            <small className="text-muted">SKU: {item.sku || '-'}</small>
                          </td>
                          <td className="fs-6">{item.quantidade}x</td>
                          <td>{formatCurrency(item.preco_unitario)}</td>
                          <td className="fw-bold fs-6">{formatCurrency(item.subtotal)}</td>
                          <td className="text-end pe-4">
                            <button 
                              className="btn btn-sm btn-outline-danger border-0" 
                              onClick={() => handleRemoverItem(index)}
                              title="Remover Item"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          Nenhum produto adicionado à venda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-footer bg-white border-top p-4">
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <span className="text-muted d-block mb-1">Lucro Estimado</span>
                  <h5 className="text-success m-0">{formatCurrency(lucroEstimado)}</h5>
                </div>
                <div className="text-end">
                  <span className="text-muted d-block mb-1">Total a Pagar</span>
                  <h2 className="text-primary fw-bold m-0" style={{ fontSize: '2.5rem' }}>
                    {formatCurrency(valorTotalVenda)}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}