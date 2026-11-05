import React, { useState, useMemo } from 'react';
import { FaCopy, FaWhatsapp } from 'react-icons/fa';
import { agruparParaCatalogo, montarTextoCatalogo } from '../../utils/catalogoTexto';
import { linkWhatsApp } from '../../utils/recibo';

/* Catálogo simples em texto (sem fotos) para mandar no WhatsApp, montado com os produtos do ERP */
export default function CatalogoWhatsAppModal({ show, onClose, produtos }) {
  const [soComEstoque, setSoComEstoque] = useState(true);
  const [mostrarTons, setMostrarTons] = useState(true);
  const [incluirLink, setIncluirLink] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const itens = useMemo(() => agruparParaCatalogo(produtos, { soComEstoque }), [produtos, soComEstoque]);
  const texto = useMemo(() => montarTextoCatalogo(itens, { mostrarTons, incluirLink }), [itens, mostrarTons, incluirLink]);

  if (!show) return null;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      alert('Não foi possível copiar. Selecione o texto e copie manualmente.');
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Catálogo para WhatsApp</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="d-flex flex-wrap gap-3 mb-3">
              <div className="form-check">
                <input id="cat-estoque" type="checkbox" className="form-check-input" checked={soComEstoque} onChange={(e) => setSoComEstoque(e.target.checked)} />
                <label htmlFor="cat-estoque" className="form-check-label">Só produtos com estoque</label>
              </div>
              <div className="form-check">
                <input id="cat-tons" type="checkbox" className="form-check-input" checked={mostrarTons} onChange={(e) => setMostrarTons(e.target.checked)} />
                <label htmlFor="cat-tons" className="form-check-label">Mostrar os tons</label>
              </div>
              <div className="form-check">
                <input id="cat-link" type="checkbox" className="form-check-input" checked={incluirLink} onChange={(e) => setIncluirLink(e.target.checked)} />
                <label htmlFor="cat-link" className="form-check-label">Incluir link do catálogo com fotos</label>
              </div>
            </div>

            <div className="text-muted small mb-1">{itens.length} produto(s) na lista. Prévia do texto:</div>
            <textarea className="form-control" rows={16} readOnly value={texto} style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }} />
          </div>

          <div className="modal-footer flex-wrap">
            <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={copiar}>
              <FaCopy /> {copiado ? 'Copiado!' : 'Copiar texto'}
            </button>
            <button
              type="button"
              className="btn btn-success d-inline-flex align-items-center gap-2"
              onClick={() => window.open(linkWhatsApp(texto, ''), '_blank', 'noopener')}
              disabled={itens.length === 0}
            >
              <FaWhatsapp /> Enviar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
