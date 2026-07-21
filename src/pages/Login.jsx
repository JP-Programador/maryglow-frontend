import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { mensagemErro } from '../services/api';
import ErrorAlert from '../components/common/ErrorAlert';

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destino = location.state?.from?.pathname || '/';

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background:
          'radial-gradient(circle at 15% 20%, rgba(184,147,90,0.16) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(168,69,107,0.12) 0%, transparent 50%), var(--mg-bg)'
      }}
    >
      <div className="card border-0 shadow-sm" style={{ maxWidth: 380, width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <p className="font-display fst-italic mb-0" style={{ fontSize: '1.8rem', color: 'var(--mg-primary-dark)' }}>
              Mary Glow
            </p>
            <span className="text-muted small text-uppercase" style={{ letterSpacing: '0.12em' }}>
              Painel de Gestão
            </span>
          </div>

          <ErrorAlert mensagem={erro} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FiMail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="seu@email.com"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label small fw-semibold">
                Senha
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <FiLock size={16} />
                </span>
                <input
                  id="senha"
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2" disabled={enviando}>
              {enviando ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <>
                  Entrar <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
