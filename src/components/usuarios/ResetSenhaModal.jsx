import React, { useEffect, useState } from 'react';

export default function ResetSenhaModal({ usuario, onClose, onConfirm }) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setSenha('');
    setConfirmacao('');
    setMostrar(false);
    setEnviando(false);
  }, [usuario]);

  if (!usuario) return null;

  const curta = senha.length > 0 && senha.length < 6;
  const diferente = confirmacao.length > 0 && senha !== confirmacao;
  const valido = senha.length >= 6 && senha === confirmacao;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valido || enviando) return;
    setEnviando(true);
    try {
      await onConfirm(usuario, senha);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Redefinir senha</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar"></button>
            </div>

            <div className="modal-body">
              <p className="mb-3">
                Nova senha para <strong>{usuario.nome}</strong> <span className="text-muted">({usuario.email})</span>.
                Ela vale já no próximo login.
              </p>

              <div className="mb-3">
                <label htmlFor="reset-senha" className="form-label">Nova senha *</label>
                <div className="input-group">
                  <input
                    id="reset-senha"
                    type={mostrar ? 'text' : 'password'}
                    className={`form-control ${curta ? 'is-invalid' : ''}`}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrar(!mostrar)}>
                    {mostrar ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {curta && <div className="text-danger small mt-1">Use pelo menos 6 caracteres.</div>}
              </div>

              <div className="mb-1">
                <label htmlFor="reset-confirmacao" className="form-label">Confirmar nova senha *</label>
                <input
                  id="reset-confirmacao"
                  type={mostrar ? 'text' : 'password'}
                  className={`form-control ${diferente ? 'is-invalid' : ''}`}
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="new-password"
                />
                {diferente && <div className="text-danger small mt-1">As senhas não conferem.</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!valido || enviando}>
                {enviando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
