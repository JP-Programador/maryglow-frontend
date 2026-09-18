import React, { useState, useEffect } from 'react';

const CAMPOS_INICIAIS = {
  nome: '', sku: '', tom: '', cor: '', estoque_atual: 0, estoque_minimo: 0,
  preco_custo: '', preco_venda: '', marca_id: '', categoria_id: '', fornecedor_id: '',
  destaque: '', visivel_catalogo: false
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://maryglow-backend.onrender.com/api').replace(/\/api$/, '');

export default function ProdutoForm({ show, onClose, onSave, produtoEditado, listas }) {
  const [formData, setFormData] = useState(CAMPOS_INICIAIS);
  const [imagemArquivo, setImagemArquivo] = useState(null);

  // Preenche o formulário se for edição
  useEffect(() => {
    if (produtoEditado) {
      setFormData({ ...CAMPOS_INICIAIS, ...produtoEditado, visivel_catalogo: !!produtoEditado.visivel_catalogo });
    } else {
      setFormData(CAMPOS_INICIAIS);
    }
    setImagemArquivo(null);
  }, [produtoEditado, show]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imagemArquivo);
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
                    {listas.fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
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
                  <input type="number" className="form-control" name="estoque_atual" value={formData.estoque_atual} onChange={handleChange} disabled={!!produtoEditado} />
                  {produtoEditado && <small className="text-muted">Ajuste via entrada/saída</small>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Estoque Mínimo</label>
                  <input type="number" className="form-control" name="estoque_minimo" value={formData.estoque_minimo} onChange={handleChange} />
                </div>

                <div className="col-12"><hr /><h6 className="text-muted">Catálogo Online</h6></div>

                <div className="col-md-6">
                  <label className="form-label">Foto do produto</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="form-control" onChange={(e) => setImagemArquivo(e.target.files[0] || null)} />
                  {produtoEditado?.imagem_url && !imagemArquivo && (
                    <img src={`${API_ORIGIN}${produtoEditado.imagem_url}`} alt="" className="mt-2 rounded" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Selo/Destaque (opcional)</label>
                  <input type="text" className="form-control" name="destaque" placeholder="Ex: Mais vendido, Novidade" value={formData.destaque} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="visivel_catalogo" name="visivel_catalogo" checked={formData.visivel_catalogo} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="visivel_catalogo">Exibir este produto no catálogo online (Mary Glow)</label>
                  </div>
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