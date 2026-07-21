import React, { useState, useEffect } from 'react';

export default function ProdutoForm({ show, onClose, onSave, produtoEditado, listas }) {
  const [formData, setFormData] = useState({
    nome: '',
    sku: '',
    tom: '',
    cor: '',
    estoque: 0,
    preco_custo: '',
    preco_venda: '',
    marca_id: '',
    categoria_id: '',
    fornecedor_id: ''
  });

  // Preenche o formulário se for edição
  useEffect(() => {
    if (produtoEditado) {
      setFormData(produtoEditado);
    } else {
      setFormData({
        nome: '', sku: '', tom: '', cor: '', estoque: 0,
        preco_custo: '', preco_venda: '', marca_id: '', categoria_id: '', fornecedor_id: ''
      });
    }
  }, [produtoEditado, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{produtoEditado ? 'Editar Produto' : 'Novo Produto'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Nome do Produto *</label>
                  <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Marca *</label>
                  <select className="form-select" name="marca_id" value={formData.marca_id} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {listas.marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Categoria *</label>
                  <select className="form-select" name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {listas.categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fornecedor *</label>
                  <select className="form-select" name="fornecedor_id" value={formData.fornecedor_id} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {listas.fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tom</label>
                  <input type="text" className="form-control" name="tom" value={formData.tom} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cor</label>
                  <input type="text" className="form-control" name="cor" value={formData.cor} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Preço de Custo *</label>
                  <input type="number" step="0.01" className="form-control" name="preco_custo" value={formData.preco_custo} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Preço de Venda *</label>
                  <input type="number" step="0.01" className="form-control" name="preco_venda" value={formData.preco_venda} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Estoque Atual</label>
                  <input type="number" className="form-control" name="estoque" value={formData.estoque} onChange={handleChange} disabled={!!produtoEditado} />
                  {produtoEditado && <small className="text-muted">Ajuste via entrada/saída</small>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Produto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}