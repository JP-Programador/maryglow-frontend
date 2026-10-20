import React, { useState, useEffect, useMemo } from 'react';
import { FaCopy, FaWhatsapp, FaPrint } from 'react-icons/fa';
import api from '../../services/api';
import { formatCurrency, formatDate, PLATAFORMAS_LABEL } from '../../utils/format';
import { montarTextoRecibo, montarHtmlRecibo, linkWhatsApp, nomeDoItem, totalAPagar, PIX } from '../../utils/recibo';
import logo from '../../assets/logo.png';

/* Recibo para o cliente: o que ele pegou e quanto tem a pagar.
   `venda` é a venda aberta (com itens); `outrasPendentes` são as demais vendas pendentes do mesmo cliente. */
export default function ReciboModal({ show, onClose, venda, outrasPendentes = [] }) {
  const [incluirOutras, setIncluirOutras] = useState(false);
  const [extras, setExtras] = useState([]); // vendas completas (com itens) das outras pendências
  const [carregando, setCarregando] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setIncluirOutras(false);
    setExtras([]);
    setTelefone('');
    setCopiado(false);
  }, [venda?.id, show]);

  // Ao marcar "incluir outras pendências", busca os itens delas
  useEffect(() => {
    if (!incluirOutras || extras.length > 0 || outrasPendentes.length === 0) return;
    let cancelado = false;
    setCarregando(true);
    Promise.all(outrasPendentes.map((v) => api.get(`/vendas/${v.id}`).then((r) => r.data.venda)))
      .then((lista) => !cancelado && setExtras(lista))
      .catch(() => !cancelado && alert('Não foi possível carregar as outras pendências do cliente.'))
      .finally(() => !cancelado && setCarregando(false));
    return () => { cancelado = true; };
  }, [incluirOutras, outrasPendentes, extras.length]);

  const vendas = useMemo(() => {
    if (!venda) return [];
    const lista = incluirOutras ? [venda, ...extras] : [venda];
    return lista.sort((a, b) => new Date(a.data_venda) - new Date(b.data_venda));
  }, [venda, extras, incluirOutras]);

  if (!show) return null;

  const cliente = venda?.cliente_nome || '';
  const pendente = vendas.some((v) => v.status_pagamento === 'pendente');
  const texto = vendas.length ? montarTextoRecibo({ cliente, vendas }) : '';

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      alert('Não foi possível copiar. Selecione o texto e copie manualmente.');
    }
  };

  const enviarWhatsApp = () => window.open(linkWhatsApp(texto, telefone), '_blank', 'noopener');

  const imprimir = () => {
    const janela = window.open('', '_blank');
    if (!janela) {
      alert('O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente de novo.');
      return;
    }
    janela.document.write(montarHtmlRecibo({ cliente, vendas, logoUrl: new URL(logo, window.location.href).href }));
    janela.document.close();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Recibo {venda ? `· Venda #${venda.id}` : ''}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {!venda ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <>
                {outrasPendentes.length > 0 && (
                  <div className="form-check mb-3">
                    <input
                      id="incluir-outras"
                      type="checkbox"
                      className="form-check-input"
                      checked={incluirOutras}
                      onChange={(e) => setIncluirOutras(e.target.checked)}
                    />
                    <label htmlFor="incluir-outras" className="form-check-label">
                      Incluir as outras {outrasPendentes.length} venda(s) pendente(s) de {cliente} no mesmo recibo
                      {carregando && <span className="text-muted ms-2">carregando...</span>}
                    </label>
                  </div>
                )}

                <div className="border rounded-3 p-3 bg-white">
                  <div className="d-flex justify-content-between flex-wrap gap-1 mb-2">
                    <strong>{cliente || 'Cliente não informado'}</strong>
                    <span className={`badge ${pendente ? 'bg-warning text-dark' : 'bg-success'}`}>{pendente ? 'Pendente' : 'Pago'}</span>
                  </div>

                  {vendas.map((v) => (
                    <div key={v.id} className="mb-3">
                      <div className="small text-muted mb-1">
                        Venda #{v.id} · {formatDate(v.data_venda)} · {PLATAFORMAS_LABEL[v.plataforma] || v.plataforma}
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead className="table-light">
                            <tr><th>Produto</th><th className="text-end">Qtd</th><th className="text-end">Unitário</th><th className="text-end">Subtotal</th></tr>
                          </thead>
                          <tbody>
                            {v.itens.map((i) => (
                              <tr key={i.id}>
                                <td>{nomeDoItem(i)}</td>
                                <td className="text-end">{i.quantidade}</td>
                                <td className="text-end">{formatCurrency(i.preco_unitario)}</td>
                                <td className="text-end">{formatCurrency(i.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center rounded-3 p-3" style={{ background: pendente ? 'var(--mg-primary-soft)' : 'var(--mg-success-soft)' }}>
                    <span>{pendente ? 'Total a pagar' : 'Total pago'}</span>
                    <strong className="fs-4">
                      {formatCurrency(pendente ? totalAPagar(vendas) : vendas.reduce((s, v) => s + Number(v.valor_total), 0))}
                    </strong>
                  </div>

                  {pendente && (
                    <div className="small mt-3">
                      <strong>Pix:</strong> {PIX.chave} · {PIX.titular}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <label htmlFor="tel-recibo" className="form-label small mb-1">WhatsApp do cliente (opcional)</label>
                  <input
                    id="tel-recibo"
                    type="tel"
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    placeholder="(11) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                  <small className="text-muted">Sem número, o WhatsApp abre para você escolher o contato.</small>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer flex-wrap">
            <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={copiar} disabled={!venda}>
              <FaCopy /> {copiado ? 'Copiado!' : 'Copiar texto'}
            </button>
            <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={imprimir} disabled={!venda || carregando}>
              <FaPrint /> Imprimir / PDF
            </button>
            <button type="button" className="btn btn-success d-inline-flex align-items-center gap-2" onClick={enviarWhatsApp} disabled={!venda || carregando}>
              <FaWhatsapp /> Enviar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
