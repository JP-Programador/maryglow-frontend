import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiTag,
  FiLayers,
  FiTruck,
  FiGift,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const GRUPOS = [
  {
    label: 'Visão geral',
    itens: [{ to: '/', label: 'Dashboard', icon: FiGrid, fim: true }]
  },
  {
    label: 'Estoque',
    itens: [
      { to: '/produtos', label: 'Produtos', icon: FiBox },
      { to: '/marcas', label: 'Marcas', icon: FiTag },
      { to: '/categorias', label: 'Categorias', icon: FiLayers },
      { to: '/fornecedores', label: 'Fornecedores', icon: FiTruck },
      { to: '/kits', label: 'Kits Promocionais', icon: FiGift }
    ]
  },
  {
    label: 'Movimentações',
    itens: [
      { to: '/compras', label: 'Compras', icon: FiShoppingCart },
      { to: '/vendas', label: 'Vendas', icon: FiDollarSign }
    ]
  },
  {
    label: 'Análises',
    itens: [{ to: '/relatorios', label: 'Relatórios', icon: FiBarChart2 }]
  }
];

export default function Sidebar({ aberta, onFechar }) {
  const { ehAdmin } = useAuth();

  return (
    <>
      {aberta && <div className="mg-sidebar-backdrop d-lg-none" onClick={onFechar} />}
      <aside className={`mg-sidebar ${aberta ? 'mg-sidebar-open' : ''}`}>
        <div className="mg-sidebar-brand">
          <p className="mg-sidebar-brand-name">Mary Glow</p>
          <span className="mg-sidebar-brand-sub">Painel de Gestão</span>
        </div>

        <nav className="mg-sidebar-nav">
          {GRUPOS.map((grupo) => (
            <div key={grupo.label}>
              <div className="mg-sidebar-section-label">{grupo.label}</div>
              {grupo.itens.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.fim}
                  onClick={onFechar}
                  className={({ isActive }) => `mg-nav-link${isActive ? ' active' : ''}`}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {ehAdmin && (
            <div>
              <div className="mg-sidebar-section-label">Administração</div>
              <NavLink
                to="/usuarios"
                onClick={onFechar}
                className={({ isActive }) => `mg-nav-link${isActive ? ' active' : ''}`}
              >
                <FiUsers size={17} />
                <span>Usuários</span>
              </NavLink>
            </div>
          )}
        </nav>

        <div className="mg-sidebar-footer">Mary Glow ERP · v1.0</div>
      </aside>
    </>
  );
}
