import React, { useState, useEffect, useRef } from 'react';
import { FaFilePdf, FaMagic, FaDownload, FaTimes } from 'react-icons/fa';
import { lerPdf, gerarPdf, planejarLadoALado, ErroPdf } from '../utils/pdfEtiquetas';

/* Seletor de um PDF: valida ao escolher e mostra quantas páginas tem */
function CampoPdf({ titulo, ajuda, valor, onChange, onLimpar }) {
  const inputRef = useRef(null);

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="mb-1">{titulo}</h5>
        <p className="text-muted small mb-3">{ajuda}</p>

        {!valor ? (
          <label
            className="d-flex flex-column align-items-center justify-content-center text-center border border-2 rounded-3 p-4"
            style={{ borderStyle: 'dashed', cursor: 'pointer', minHeight: 130 }}
          >
            <FaFilePdf size={28} className="text-muted mb-2" />
            <span className="fw-semibold">Selecionar PDF</span>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="d-none"
              onChange={(e) => {
                onChange(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </label>
        ) : (
          <div className="border rounded-3 p-3">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="text-break">
                <div className="fw-semibold"><FaFilePdf className="me-2 text-danger" />{valor.nome}</div>
                <small className="text-muted">{valor.paginas} página(s)</small>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary border-0" onClick={onLimpar} title="Remover">
                <FaTimes />
              </button>
            </div>
            {valor.paginas > 1 && (
              <div className="mt-3">
                <label className="form-label small mb-1">Este PDF tem mais de uma página. Qual usar?</label>
                <select
                  className="form-select form-select-sm"
                  value={valor.pagina}
                  onChange={(e) => onChange(null, Number(e.target.value))}
                >
                  {Array.from({ length: valor.paginas }, (_, i) => (
                    <option key={i} value={i}>Página {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CentralEtiquetas() {
  const [etiqueta, setEtiqueta] = useState(null); // { nome, doc, paginas, pagina }
  const [nota, setNota] = useState(null);
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState(null); // { url, nome, modo }
  const [precisaSeparar, setPrecisaSeparar] = useState(false);

  // Libera o blob da pré-visualização quando troca ou sai da tela
  useEffect(() => () => {
    if (resultado?.url) URL.revokeObjectURL(resultado.url);
  }, [resultado]);

  const limparResultado = () => {
    setResultado(null);
    setPrecisaSeparar(false);
  };

  const escolher = (setter, rotulo, atual) => async (arquivo, novaPagina) => {
    setErro('');
    limparResultado();
    // Troca só a página escolhida de um PDF já carregado
    if (!arquivo) {
      setter({ ...atual, pagina: novaPagina });
      return;
    }
    try {
      const { doc, paginas } = await lerPdf(arquivo, rotulo);
      setter({ nome: arquivo.name, doc, paginas, pagina: 0 });
    } catch (err) {
      setter(null);
      setErro(err instanceof ErroPdf ? err.message : `Não foi possível abrir o PDF da ${rotulo}.`);
    }
  };

  const gerar = async (modo) => {
    setErro('');
    limparResultado();
    if (!etiqueta || !nota) {
      setErro('Selecione os dois PDFs: etiqueta de envio e nota fiscal.');
      return;
    }
    setGerando(true);
    try {
      // Antes de gerar, confere se cabe lado a lado com legibilidade
      if (modo === 'lado') {
        const plano = planejarLadoALado(etiqueta.doc.getPage(etiqueta.pagina), nota.doc.getPage(nota.pagina));
        if (!plano.legivel) {
          setPrecisaSeparar(true);
          setErro(
            'Os documentos não cabem lado a lado com legibilidade (a redução ficaria grande demais). ' +
            'Nada foi gerado. Você pode imprimir cada documento em uma página separada.'
          );
          return;
        }
      }
      const bytes = await gerarPdf({ etiqueta: { ...etiqueta }, nota: { ...nota }, modo });
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      setResultado({ url, modo, nome: modo === 'lado' ? 'etiqueta-e-nota-A4.pdf' : 'etiqueta-e-nota-separadas.pdf' });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setErro(err instanceof ErroPdf ? err.message : 'Erro ao processar os PDFs. Nenhum arquivo foi gerado.');
    } finally {
      setGerando(false);
    }
  };

  const reiniciar = () => {
    setEtiqueta(null);
    setNota(null);
    setErro('');
    limparResultado();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
        <h2 className="m-0">Central de Etiquetas</h2>
        {(etiqueta || nota) && (
          <button className="btn btn-outline-secondary btn-sm" onClick={reiniciar}>Limpar tudo</button>
        )}
      </div>
      <p className="text-muted mb-4">
        Junta a etiqueta de envio e a nota fiscal (Shopee, TikTok Shop) em uma folha A4 horizontal, cada um ampliado para ocupar uma metade da folha.
        Os arquivos ficam só no seu navegador: nada é enviado ou salvo no sistema, e as páginas originais não são alteradas.
      </p>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <CampoPdf
            titulo="1. Etiqueta de envio"
            ajuda="PDF da etiqueta (lado esquerdo da folha)."
            valor={etiqueta}
            onChange={escolher(setEtiqueta, 'etiqueta de envio', etiqueta)}
            onLimpar={() => { setEtiqueta(null); limparResultado(); }}
          />
        </div>
        <div className="col-md-6">
          <CampoPdf
            titulo="2. Nota fiscal (DANFE)"
            ajuda="PDF da nota fiscal (lado direito da folha)."
            valor={nota}
            onChange={escolher(setNota, 'nota fiscal', nota)}
            onLimpar={() => { setNota(null); limparResultado(); }}
          />
        </div>
      </div>

      {erro && (
        <div className="alert alert-warning d-flex flex-column gap-2" role="alert">
          <span>{erro}</span>
          {precisaSeparar && (
            <div>
              <button className="btn btn-sm btn-dark" onClick={() => gerar('separadas')} disabled={gerando}>
                Gerar em páginas separadas
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <button
          className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
          onClick={() => gerar('lado')}
          disabled={!etiqueta || !nota || gerando}
        >
          <FaMagic /> {gerando ? 'Gerando...' : 'Gerar PDF'}
        </button>
      </div>

      {resultado && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="m-0">3. Pré-visualização {resultado.modo === 'separadas' ? '(páginas separadas)' : '(A4 horizontal)'}</h5>
            <a className="btn btn-success d-inline-flex align-items-center gap-2" href={resultado.url} download={resultado.nome}>
              <FaDownload /> Baixar PDF
            </a>
          </div>
          <div className="card-body p-0">
            <iframe
              title="Pré-visualização do PDF"
              src={resultado.url}
              style={{ width: '100%', height: '70vh', minHeight: 360, border: 0 }}
            />
          </div>
          <div className="card-footer bg-white text-muted small">
            Confira a prévia antes de imprimir. Ao imprimir, use tamanho A4 e escala 100% ("tamanho real"), sem "ajustar à página".
          </div>
        </div>
      )}
    </div>
  );
}
