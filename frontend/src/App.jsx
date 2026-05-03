import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Vitrine from './pages/Vitrine';
import DetalhesProduto from './pages/DetalhesProduto';
import Carrinho from './pages/Carrinho';
import { Login, Cadastro } from './pages/Auth';
import MeusPedidos from './pages/MeusPedidos';
import { AdminLogin, AdminLayout } from './pages/Admin';
import Dashboard from './pages/AdminDashboard';
import AdminProdutos from './pages/AdminProdutos';
import AdminPedidos from './pages/AdminPedidos';
import { AdminUsuarios, AdminCupons } from './pages/AdminUsuariosECupons';

function LayoutPublico({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Público */}
            <Route path="/"           element={<LayoutPublico><Vitrine /></LayoutPublico>} />
            <Route path="/produto/:id" element={<LayoutPublico><DetalhesProduto /></LayoutPublico>} />
            <Route path="/carrinho"   element={<LayoutPublico><Carrinho /></LayoutPublico>} />
            <Route path="/login"      element={<LayoutPublico><Login /></LayoutPublico>} />
            <Route path="/cadastro"   element={<LayoutPublico><Cadastro /></LayoutPublico>} />
            <Route path="/meus-pedidos" element={<LayoutPublico><MeusPedidos /></LayoutPublico>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="produtos"  element={<AdminProdutos />} />
              <Route path="pedidos"   element={<AdminPedidos />} />
              <Route path="usuarios"  element={<AdminUsuarios />} />
              <Route path="cupons"    element={<AdminCupons />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
