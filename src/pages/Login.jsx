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
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative"
      style={{
        backgroundColor: '#faf6f3',
        overflow: 'hidden'
      }}
    >
      {/* Keyframes de Animação para 4 rotas de estouro */}
      <style>{`
        /* Rota 1: Topo Esquerdo -> Centro Direita */
        @keyframes encheAndaEstoura1 {
          0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
          15% { transform: translate(40px, -10px) scale(1); opacity: 0.85; }
          70% { transform: translate(calc(55vw - 50px), 100px) scale(1.25); opacity: 0.9; }
          85% { transform: translate(calc(60vw - 50px), 110px) scale(1.5); opacity: 1; }
          88% { transform: translate(calc(60vw - 50px), 110px) scale(2.2); opacity: 0; }
          100% { transform: translate(0, 0) scale(0.2); opacity: 0; }
        }

        /* Rota 2: Baixo Direita -> Centro Esquerda */
        @keyframes encheAndaEstoura2 {
          0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
          20% { transform: translate(-30px, 20px) scale(1.1); opacity: 0.8; }
          75% { transform: translate(calc(-50vw + 50px), -120px) scale(1.35); opacity: 0.85; }
          90% { transform: translate(calc(-55vw + 50px), -130px) scale(1.7); opacity: 1; }
          93% { transform: translate(calc(-55vw + 50px), -130px) scale(2.3); opacity: 0; }
          100% { transform: translate(0, 0) scale(0.2); opacity: 0; }
        }

        /* Rota 3: Topo Direita -> Baixo Esquerda */
        @keyframes encheAndaEstoura3 {
          0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
          15% { transform: translate(-20px, 40px) scale(0.9); opacity: 0.85; }
          65% { transform: translate(calc(-45vw), 250px) scale(1.2); opacity: 0.9; }
          80% { transform: translate(calc(-50vw), 280px) scale(1.5); opacity: 1; }
          83% { transform: translate(calc(-50vw), 280px) scale(2.1); opacity: 0; }
          100% { transform: translate(0, 0) scale(0.2); opacity: 0; }
        }

        /* Rota 4: Baixo Esquerda -> Topo Direita */
        @keyframes encheAndaEstoura4 {
          0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
          25% { transform: translate(30px, -30px) scale(1); opacity: 0.8; }
          70% { transform: translate(calc(50vw), -220px) scale(1.3); opacity: 0.85; }
          88% { transform: translate(calc(55vw), -240px) scale(1.6); opacity: 1; }
          91% { transform: translate(calc(55vw), -240px) scale(2.2); opacity: 0; }
          100% { transform: translate(0, 0) scale(0.2); opacity: 0; }
        }
      `}</style>

      {/* 1. Bolha Vinho Escuro (Topo Esquerdo) */}
      <div 
        style={{
          position: 'absolute',
          top: '10%',
          left: '3%',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 35, 75, 0.8) 0%, rgba(90, 15, 45, 0.4) 65%, transparent 100%)',
          filter: 'blur(35px)',
          animation: 'encheAndaEstoura1 10s cubic-bezier(0.25, 1, 0.5, 1) infinite',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      {/* 2. Bolha Ameixa / Rosê Escuro (Baixo Direita) */}
      <div 
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '3%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(158, 61, 100, 0.75) 0%, rgba(110, 30, 65, 0.35) 70%, transparent 100%)',
          filter: 'blur(38px)',
          animation: 'encheAndaEstoura2 12s cubic-bezier(0.25, 1, 0.5, 1) infinite',
          animationDelay: '2.5s',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      {/* 3. Bolha Dourada Queimada / Glow (Topo Direito) */}
      <div 
        style={{
          position: 'absolute',
          top: '8%',
          right: '5%',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184, 130, 60, 0.75) 0%, rgba(140, 85, 30, 0.35) 65%, transparent 100%)',
          filter: 'blur(32px)',
          animation: 'encheAndaEstoura3 11s cubic-bezier(0.25, 1, 0.5, 1) infinite',
          animationDelay: '5s',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      {/* 4. Bolha Carmim / Batom Intenso (Baixo Esquerdo) */}
      <div 
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '5%',
          width: '230px',
          height: '230px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165, 42, 85, 0.8) 0%, rgba(120, 20, 55, 0.4) 65%, transparent 100%)',
          filter: 'blur(35px)',
          animation: 'encheAndaEstoura4 13s cubic-bezier(0.25, 1, 0.5, 1) infinite',
          animationDelay: '7.5s',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      {/* Card de Login */}
      <div 
        className="card border-0 shadow-lg position-relative" 
        style={{ 
          maxWidth: 380, 
          width: '100%',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 45px rgba(138, 35, 75, 0.12)'
        }}
      >
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
                  className="form-control border-start-0 ps-0 bg-white"
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
                  className="form-control border-start-0 ps-0 bg-white"
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