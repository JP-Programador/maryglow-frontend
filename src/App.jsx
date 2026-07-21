import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Usuarios from './pages/Usuarios';
// Páginas Base
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmConstrucao from './pages/EmConstrucao';

// Páginas de Cadastros
import Produtos from './pages/Produtos';
import Marcas from './pages/Marcas';
import Categorias from './pages/Categorias';
import Fornecedores from './pages/Fornecedores';

// Páginas de Movimentação
import Compras from './pages/Compras';
import NovaCompra from './pages/NovaCompra';
import Vendas from './pages/Vendas';
import NovaVenda from './pages/NovaVenda';
import Relatorios from './pages/Relatorios';
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Privadas (O ProtectedRoute "pai" protege todas as rotas filhas) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Cadastros */}
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/marcas" element={<Marcas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            
            {/* Movimentações */}
            <Route path="/compras" element={<Compras />} />
            <Route path="/compras/nova" element={<NovaCompra />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/vendas/nova" element={<NovaVenda />} />

            {/* Relatórios */}
            <Route path="/relatorios" element={<Relatorios />} />

            {/* Rotas exclusivas para Admin */}
            <Route element={<ProtectedRoute somenteAdmin />}>
               <Route path="/usuarios" element={<Usuarios />} />
            </Route>

            {/* Rota 404 - Sempre por último */}
            <Route path="*" element={<EmConstrucao titulo="Página não encontrada" />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}