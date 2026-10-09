import React, { useState, useEffect } from 'react';

const CAMPOS_INICIAIS = {
  nome: '', sku: '', tom: '', cor: '', estoque_atual: 0, estoque_minimo: 0,
  preco_custo: '', custo_embalagem: '0', outros_custos: '0', preco_venda: '', marca_id: '', categoria_id: '', fornecedor_id: '',
  destaque: '', descricao: '', modo_uso: '', visivel_catalogo: false
};

const MAX_FOTOS = 10;
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://maryglow-backend.onrender.com/api').replace(/\/api$/, '');

export default function ProdutoForm({ show, onClose, onSave, produtoEditado, listas }) {
  const [formData, setFormData] = useState(CAMPOS_INICIAIS);
  const [novasFotos, setNovasFotos] = useState([]);
  const [galeria, setGaleria] = useState([]); // fotos existentes, já na ordem atual (exclui as removidas)

  // Preenche o formulário se for edição
  useEffect(() => {
    if (produtoEditado) {
      setFormData({
        ...CAMPOS_INICIAIS,
        ...produtoEditado,
        descricao: produtoEditado.descricao || '',
        modo_uso: produtoEditado.modo_uso || '',
        destaque: produtoEditado.destaque || '',
        visivel_catalogo: !!produtoEditado.visivel_catalogo
      });
    } else {
      setFormData(CAMPOS_INICIAIS);
    }
    setNovasFotos([]);
    setGaleria(produtoEditado?.imagens || []);
  }, [produtoEditado, show]);

  const fotosAtuais = galeria;
  const vagas = MAX_FOTOS - fotosAtuais.length - novasFotos.length;

  const removerFotoExistente = (id) => setGaleria(galeria.filter((f) => f.id !== id));

  const moverFotoExistente = (indice, direcao) => {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= galeria.length) return;
    const copia = [...galeria];
    [copia[indice], copia[alvo]] = [copia[alvo], copia[indice]];
    setGaleria(copia);
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const adicionarFotos = (e) => {
    const escolhidas = Array.from(e.target.files).slice(0, Math.max(vagas, 0));
    if (e.target.files.length > escolhidas.length) {
      alert(`Cada produto aceita no máximo ${MAX_FOTOS} fotos.`);
    }
    setNovasFotos([...novasFotos, ...escolhidas]);
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fotosRemovidas = (produtoEditado?.imagens || [])
      .filter((f) => !galeria.some((g) => g.id === f.id))
      .map((f) => f.id);
    onSave(formData, novasFotos, fotosRemovidas, galeria.map((f) => f.id));
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
                  <label className="form-label">Custo da embalagem</label>
                  <input type="number" step="0.01" min="0" className="form-control" name="custo_embalagem" value={formData.custo_embalagem} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Outros custos</label>
                  <input type="number" step="0.01" min="0" className="form-control" name="outros_custos" value={formData.outros_custos} onChange={handleChange} />
                  <small className="text-muted">O custo total é somado automaticamente na Precificação.</small>
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

                <div className="col-12">
                  <label className="form-label">Fotos do produto ({MAX_FOTOS - vagas}/{MAX_FOTOS}) — a primeira é a capa</label>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="form-control"
                    onChange={adicionarFotos}
                    disabled={vagas <= 0}
                  />
                  {(fotosAtuais.length > 0 || novasFotos.length > 0) && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {fotosAtuais.map((foto, idx) => (
                        <div key={foto.id} className="position-relative">
                          <img src={`${API_ORIGIN}${foto.url}`} alt="" className="rounded border" style={{ width: 72, height: 72, objectFit: 'cover' }} />
                          {idx === 0 && (
                            <span className="position-absolute bottom-0 start-0 badge bg-dark bg-opacity-75" style={{ fontSize: 9 }}>capa</span>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 lh-1"
                            style={{ width: 20, height: 20 }}
                            title="Remover foto"
                            onClick={() => removerFotoExistente(foto.id)}
                          >
                            ×
                          </button>
                          <div className="position-absolute top-0 start-0 d-flex" style={{ gap: 2 }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-0 lh-1"
                              style={{ width: 20, height: 20, fontSize: 12 }}
                              title="Mover para a esquerda"
                              disabled={idx === 0}
                              onClick={() => moverFotoExistente(idx, -1)}
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border p-0 lh-1"
                              style={{ width: 20, height: 20, fontSize: 12 }}
                              title="Mover para a direita"
                              disabled={idx === fotosAtuais.length - 1}
                              onClick={() => moverFotoExistente(idx, 1)}
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      ))}
                      {novasFotos.map((arquivo, idx) => (
                        <div key={`${arquivo.name}-${idx}`} className="position-relative">
                          <img src={URL.createObjectURL(arquivo)} alt="" className="rounded border border-success" style={{ width: 72, height: 72, objectFit: 'cover' }} />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 lh-1"
                            style={{ width: 20, height: 20 }}
                            title="Remover foto"
                            onClick={() => setNovasFotos(novasFotos.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <small className="text-muted">JPG, PNG ou WEBP, até 5MB cada. Fotos novas aparecem com borda verde. Use ‹ › para mudar a ordem — a primeira foto é a capa.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Selo/Destaque (opcional)</label>
                  <input type="text" className="form-control" name="destaque" placeholder="Ex: Mais vendido, Novidade" value={formData.destaque} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" rows={3} name="descricao" placeholder="Fale sobre o produto (aparece na página de detalhes)" value={formData.descricao} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Modo de uso</label>
                  <textarea className="form-control" rows={2} name="modo_uso" placeholder="Como aplicar/usar" value={formData.modo_uso} onChange={handleChange} />
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