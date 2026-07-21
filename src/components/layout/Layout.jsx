import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITULOS_ROTA = {
  '/': 'Dashboard',
  '/produtos': 'Produtos',
  '/marcas': 'Marcas',
  '/categorias': 'Categorias',
  '/fornecedores': 'Fornecedores',
  '/compras': 'Compras',
  '/vendas': 'Vendas',
  '/relatorios': 'Relatórios',
  '/usuarios': 'Usuários'
};

export default function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const titulo = TITULOS_ROTA[location.pathname] || 'Mary Glow ERP';

  return (
    <div className="mg-app">
      <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />
      <div className="mg-main">
        <Topbar titulo={titulo} onAbrirMenu={() => setMenuAberto(true)} />
        <main className="mg-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
