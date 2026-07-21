import { useState, useRef, useEffect } from 'react';
import { FiMenu, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ titulo, onAbrirMenu }) {
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  const iniciais = usuario?.nome
    ? usuario.nome
        .split(' ')
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="mg-topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mg-sidebar-toggle border-0"
          onClick={onAbrirMenu}
          aria-label="Abrir menu"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="page-title h5 mb-0">{titulo}</h1>
      </div>

      <div className="position-relative" ref={menuRef}>
        <button
          type="button"
          className="btn d-flex align-items-center gap-2 border-0 bg-transparent p-1"
          onClick={() => setMenuAberto((v) => !v)}
        >
          <span className="mg-user-avatar">{iniciais}</span>
          <span className="d-none d-sm-inline small text-body">{usuario?.nome}</span>
          <FiChevronDown size={16} className="text-muted" />
        </button>

        {menuAberto && (
          <div
            className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-sm border py-2"
            style={{ minWidth: 200, zIndex: 1040 }}
          >
            <div className="px-3 pb-2 mb-1 border-bottom">
              <div className="small fw-semibold">{usuario?.nome}</div>
              <div className="small text-muted text-truncate">{usuario?.email}</div>
              <span className="badge badge-soft-primary mt-1 text-capitalize">{usuario?.nivel}</span>
            </div>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center gap-2 text-danger px-3 py-2"
              onClick={sair}
            >
              <FiLogOut size={16} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
