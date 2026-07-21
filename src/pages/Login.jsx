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
    <div className="login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden">
      {/* Estilos CSS embutidos para animação fluida das manchas de maquiagem */}
      <style>{`
        .login-wrapper {
          background-color: #fdfaf8;
        }

        /* Mancha 1: Tom Vinho/Batom Mary Glow */
        .glow-blob-1 {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 69, 107, 0.28) 0%, rgba(184, 147, 90, 0.1) 50%, transparent 70%);
          filter: blur(80px);
          animation: floatGlow1 14s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* Mancha 2: Tom Nude Iluminador/Gloss */
        .glow-blob-2 {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 147, 90, 0.25) 0%, rgba(168, 69, 107, 0.12) 50%, transparent 70%);
          filter: blur(90px);
          animation: floatGlow2 18s ease-in-out infinite alternate;
          pointer-events: none;
        }

        /* Animações de movimento suave e expansão */
        @keyframes floatGlow1 {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(120px, 80px) scale(1.15) rotate(30deg);
          }
          100% {
            transform: translate(-50px, 140px) scale(0.9) rotate(-15deg);
          }
        }

        @keyframes floatGlow2 {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(-100px, -90px) scale(1.2) rotate(-40deg);
          }
          100% {
            transform: translate(60px, -40px) scale(0.95) rotate(20deg);
          }
        }

        /* Card de Login com efeito Vidro Fosco (Glassmorphism) */
        .glass-card {
          background: rgba(255, 255, 255, 0.72) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 20px 40px rgba(168, 69, 107, 0.08) !important;
        }

        .input-group-text, .form-control {
          background-color: rgba(255, 255, 255, 0.85) !important;
        }
      `}</style>

      {/* Camadas orgânicas de blush/iluminador dinâmico */}
      <div className="glow-blob-1" />
      <div className="glow-blob-2" />

      {/* Formas orgânicas adicionais para profundidade */}
      <div 
        className="position-absolute" 
        style={{
          top: '40%',
          left: '50%',
          width: '350px',
          height: '350px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(235, 210, 200, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} 
      />

      <div className="card glass-card border-0 position-relative z-1" style={{ maxWidth: 380, width: '100%' }}>
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
                <span className="input-group-text border-end-0 text-muted">
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
                <span className="input-group-text border-end-0 text-muted">
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