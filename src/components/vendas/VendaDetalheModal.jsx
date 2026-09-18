import React from 'react';
import { formatCurrency, formatDateTime, PLATAFORMAS_LABEL, PAGAMENTOS_LABEL } from '../../utils/format';

export default function VendaDetalheModal({ show, onClose, venda, carregando }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Venda #{venda?.id ?? ''}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {carregando ? (
              <div className="text-center py-4">Carregando detalhes...</div>
            ) : !venda ? (
              <div className="text-center py-4 text-muted">Não foi possível carregar esta venda.</div>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="text-muted small">Data</div>
                    <div className="fw-semibold">{formatDateTime(venda.data_venda)}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Plataforma</div>
                    <div className="fw-semibold">{PLATAFORMAS_LABEL[venda.plataforma] || venda.plataforma}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Pagamento</div>
                    <div className="fw-semibold">{PAGAMENTOS_LABEL[venda.forma_pagamento] || venda.forma_pagamento}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Vendedor(a)</div>
                    <div className="fw-semibold">{venda.usuario_nome || '-'}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Valor total</div>
                    <div className="fw-bold">{formatCurrency(venda.valor_total)}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Lucro</div>
                    <div className="fw-bold text-success">{formatCurrency(venda.lucro_total)}</div>
                  </div>
                  {venda.observacao && (
                    <div className="col-12">
                      <div className="text-muted small">Observação</div>
                      <div>{venda.observacao}</div>
                    </div>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Produto</th>
                        <th>SKU</th>
                        <th>Qtd</th>
                        <th>Unitário</th>
                        <th>Subtotal</th>
                        <th className="text-success">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(venda.itens || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.produto_nome}</td>
                          <td className="text-muted">{item.produto_sku}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatCurrency(item.preco_unitario)}</td>
                          <td className="fw-semibold">{formatCurrency(item.subtotal)}</td>
                          <td className="text-success">{formatCurrency(item.lucro)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
