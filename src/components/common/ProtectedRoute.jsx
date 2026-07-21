import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ somenteAdmin = false }) {
  const { usuario, carregando, ehAdmin } = useAuth();

  if (carregando) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <LoadingSpinner texto="Verificando sessão..." />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (somenteAdmin && !ehAdmin) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <h2 className="page-title h4">Acesso restrito</h2>
        <p className="text-muted">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return <Outlet />;
}
