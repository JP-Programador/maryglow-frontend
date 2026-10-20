import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCheck, FiAlertTriangle, FiAlertCircle, FiHelpCircle } from 'react-icons/fi';
import '../../styles/dialogs.css';

/* Caixas de diálogo no padrão Mary Glow.
   - alert(...) do navegador passa a abrir um aviso estilizado (sucesso / atenção / erro),
     sem mudar nenhum dos lugares que já chamam alert().
   - confirmar(mensagem) substitui window.confirm: devolve uma Promise<boolean>. */

const TEMPO_SUCESSO_MS = 3500;

// Ponte entre quem chama (qualquer lugar do app) e o provider que desenha o diálogo
let abrir = null;

const ERRO = /erro|n[ãa]o foi poss[ií]vel|falh|inv[áa]lid|insuficiente|permiss[ãa]o|n[ãa]o p[oô]de/i;
const SUCESSO = /sucesso|registrad[oa]|finalizad[oa]|atualizad[oa]|redefinid[oa]|salv[oa]/i;
const PERIGO = /excluir|cancelar|remover|apagar/i;

function tipoDoAviso(mensagem) {
  if (ERRO.test(mensagem)) return 'erro';
  if (SUCESSO.test(mensagem)) return 'sucesso';
  return 'atencao';
}

export function confirmar(mensagem, opcoes = {}) {
  if (!abrir) return Promise.resolve(window.confirm(mensagem)); // provider ainda não montou
  return new Promise((resolve) => {
    abrir({
      tipo: opcoes.perigo ?? PERIGO.test(mensagem) ? 'perigo' : 'pergunta',
      titulo: opcoes.titulo,
      mensagem: String(mensagem),
      confirmarTexto: opcoes.confirmarTexto || 'Confirmar',
      cancelarTexto: opcoes.cancelarTexto || 'Voltar',
      resolver: resolve,
      confirmacao: true
    });
  });
}

const VISUAL = {
  sucesso: { Icone: FiCheck, titulo: 'Tudo certo!', classe: 'is-sucesso' },
  atencao: { Icone: FiAlertCircle, titulo: 'Atenção', classe: 'is-atencao' },
  erro: { Icone: FiAlertTriangle, titulo: 'Algo deu errado', classe: 'is-erro' },
  pergunta: { Icone: FiHelpCircle, titulo: 'Confirmar ação', classe: 'is-pergunta' },
  perigo: { Icone: FiAlertTriangle, titulo: 'Tem certeza?', classe: 'is-erro' }
};

export default function DialogProvider({ children }) {
  const [fila, setFila] = useState([]);
  const botaoRef = useRef(null);
  const atual = fila[0];

  const empilhar = useCallback((dialogo) => setFila((f) => [...f, dialogo]), []);

  // Registra a ponte e troca o alert nativo pelo aviso estilizado
  useEffect(() => {
    abrir = empilhar;
    const alertOriginal = window.alert;
    window.alert = (mensagem) => {
      const texto = String(mensagem ?? '');
      empilhar({ tipo: tipoDoAviso(texto), mensagem: texto, confirmacao: false });
    };
    return () => {
      abrir = null;
      window.alert = alertOriginal;
    };
  }, [empilhar]);

  const fechar = useCallback((resultado) => {
    setFila((f) => {
      if (f[0]?.resolver) f[0].resolver(resultado);
      return f.slice(1);
    });
  }, []);

  // Sucesso some sozinho; erro e confirmação esperam o clique
  useEffect(() => {
    if (!atual || atual.tipo !== 'sucesso') return undefined;
    const t = setTimeout(() => fechar(true), TEMPO_SUCESSO_MS);
    return () => clearTimeout(t);
  }, [atual, fechar]);

  useEffect(() => {
    if (!atual) return undefined;
    botaoRef.current?.focus();
    const aoTeclar = (e) => {
      if (e.key === 'Escape') fechar(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [atual, fechar]);

  const visual = atual ? VISUAL[atual.tipo] : null;

  return (
    <>
      {children}
      {atual && (
        <div className="mg-dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && fechar(false)}>
          <div
            className={`mg-dialog ${visual.classe}`}
            role={atual.confirmacao ? 'alertdialog' : 'alert'}
            aria-modal="true"
            aria-labelledby="mg-dialog-titulo"
            aria-describedby="mg-dialog-texto"
          >
            <div className="mg-dialog-icone"><visual.Icone size={26} /></div>
            <h3 id="mg-dialog-titulo" className="mg-dialog-titulo">{atual.titulo || visual.titulo}</h3>
            <p id="mg-dialog-texto" className="mg-dialog-texto">{atual.mensagem}</p>

            <div className="mg-dialog-acoes">
              {atual.confirmacao && (
                <button type="button" className="mg-dialog-btn mg-dialog-btn-sec" onClick={() => fechar(false)}>
                  {atual.cancelarTexto}
                </button>
              )}
              <button ref={botaoRef} type="button" className="mg-dialog-btn mg-dialog-btn-pri" onClick={() => fechar(true)}>
                {atual.confirmacao ? atual.confirmarTexto : 'OK'}
              </button>
            </div>

            {atual.tipo === 'sucesso' && (
              <div className="mg-dialog-progresso" style={{ animationDuration: `${TEMPO_SUCESSO_MS}ms` }} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
