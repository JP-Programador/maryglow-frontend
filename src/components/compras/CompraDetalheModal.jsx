import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function CompraDetalheModal({ show, onClose, compra, carregando }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Compra #{compra?.id ?? ''}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar"></button>
          </div>

          <div className="modal-body">
            {carregando ? (
              <div className="text-center py-4">Carregando detalhes...</div>
            ) : !compra ? (
              <div className="text-center py-4 text-muted">Não foi possível carregar esta compra.</div>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="text-muted small">Data</div>
                    <div className="fw-semibold">{formatDateTime(compra.data_compra)}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Fornecedor</div>
                    <div className="fw-semibold">{compra.fornecedor_nome || '-'}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Registrada por</div>
                    <div className="fw-semibold">{compra.usuario_nome || '-'}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Valor total</div>
                    <div className="fw-bold text-success">{formatCurrency(compra.valor_total)}</div>
                  </div>
                  {compra.observacao && (
                    <div className="col-12">
                      <div className="text-muted small">Observação</div>
                      <div>{compra.observacao}</div>
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
                        <th>Custo unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(compra.itens || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.produto_nome}</td>
                          <td className="text-muted">{item.produto_sku}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatCurrency(item.custo_unitario)}</td>
                          <td className="fw-semibold">{formatCurrency(item.subtotal)}</td>
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
