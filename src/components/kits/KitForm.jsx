import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const ITEM_VAZIO = () => ({ rotulo: '', produto_ids: [] });

export default function KitForm({ show, onClose, onSave, produtos }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [destaque, setDestaque] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modoUso, setModoUso] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [itens, setItens] = useState([ITEM_VAZIO()]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (show) {
      setNome('');
      setPreco('');
      setDestaque('');
      setDescricao('');
      setModoUso('');
      setImagemArquivo(null);
      setItens([ITEM_VAZIO()]);
    }
  }, [show]);

  if (!show) return null;

  const adicionarItem = () => setItens([...itens, ITEM_VAZIO()]);

  const removerItem = (idx) => setItens(itens.filter((_, i) => i !== idx));

  const atualizarRotulo = (idx, valor) => {
    const novos = [...itens];
    novos[idx] = { ...novos[idx], rotulo: valor };
    setItens(novos);
  };

  const alternarProduto = (idx, produtoId) => {
    const novos = [...itens];
    const jaSelecionado = novos[idx].produto_ids.includes(produtoId);
    novos[idx] = {
      ...novos[idx],
      produto_ids: jaSelecionado
        ? novos[idx].produto_ids.filter((id) => id !== produtoId)
        : [...novos[idx].produto_ids, produtoId]
    };
    setItens(novos);
  };

  const valido =
    nome.trim() &&
    Number(preco) > 0 &&
    itens.length > 0 &&
    itens.every((item) => item.rotulo.trim() && item.produto_ids.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valido || salvando) return;
    setSalvando(true);
    try {
      await onSave({ nome, preco, destaque, descricao, modo_uso: modoUso, itens }, imagemArquivo);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Novo Kit Promocional</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Nome do kit *</label>
                  <input type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Kit 2 Lip Gloss + 1 Lip Oil" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Preço do kit *</label>
                  <input type="number" step="0.01" className="form-control" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Foto do kit</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="form-control"
                    onChange={(e) => setImagemArquivo(e.target.files[0] || null)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Selo/Destaque (opcional)</label>
                  <input type="text" className="form-control" value={destaque} onChange={(e) => setDestaque(e.target.value)}
                    placeholder="Ex: Combo, Economize" />
                </div>

                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    placeholder="O que vem no kit (aparece na página de detalhes)" />
                </div>
                <div className="col-12">
                  <label className="form-label">Modo de uso</label>
                  <textarea className="form-control" rows={2} value={modoUso} onChange={(e) => setModoUso(e.target.value)} />
                </div>

                <div className="col-12"><hr /></div>

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Itens do kit (slots de escolha)</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={adicionarItem}>
                    <FaPlus size={12} /> Adicionar item
                  </button>
                </div>

                {itens.map((item, idx) => (
                  <div key={idx} className="col-12">
                    <div className="border rounded p-3">
                      <div className="d-flex gap-2 align-items-start mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder='Rótulo exibido ao cliente (ex: "Escolha o tom do Gloss 1")'
                          value={item.rotulo}
                          onChange={(e) => atualizarRotulo(idx, e.target.value)}
                        />
                        {itens.length > 1 && (
                          <button type="button" className="btn btn-outline-danger" onClick={() => removerItem(idx)}>
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>

                      <label className="form-label small text-muted mb-1">
                        Produtos que o cliente pode escolher nesse slot ({item.produto_ids.length} selecionado{item.produto_ids.length !== 1 ? 's' : ''})
                      </label>
                      <div className="border rounded p-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                        {produtos.length === 0 ? (
                          <small className="text-muted">Nenhum produto cadastrado ainda.</small>
                        ) : (
                          produtos.map((p) => (
                            <div className="form-check" key={p.id}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`kit-item-${idx}-produto-${p.id}`}
                                checked={item.produto_ids.includes(p.id)}
                                onChange={() => alternarProduto(idx, p.id)}
                              />
                              <label className="form-check-label small" htmlFor={`kit-item-${idx}-produto-${p.id}`}>
                                {p.nome} {p.tom ? `— ${p.tom}` : ''} <span className="text-muted">({p.sku})</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!valido || salvando}>
                {salvando ? 'Salvando...' : 'Salvar Kit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
