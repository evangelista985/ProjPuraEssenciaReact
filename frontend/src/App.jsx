import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Vitrine from './pages/Vitrine';
import DetalhesProduto from './pages/DetalhesProduto';
import Carrinho from './pages/Carrinho';
import CheckoutEndereco from './pages/CheckoutEndereco';
import CheckoutPagamento from './pages/CheckoutPagamento';
import { Login, Cadastro } from './pages/Auth';
import MeusPedidos from './pages/MeusPedidos';
import { AdminLogin, AdminLayout } from './pages/Admin';
import Dashboard from './pages/AdminDashboard';
import AdminProdutos from './pages/AdminProdutos';
import AdminPedidos from './pages/AdminPedidos';
import { AdminUsuarios, AdminCupons } from './pages/AdminUsuariosECupons';
import EsqueciSenha from './pages/EsqueciSenha';
import Chas from './pages/Chas';
import Organicos from './pages/Organicos';
import Temperos from './pages/Temperos';
import Cosmeticos from './pages/Cosmeticos';
import Produtos from './pages/Produtos';

// ScrollToTop DEVE ficar dentro do BrowserRouter
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function LayoutPublico({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Público */}
        <Route path="/"             element={<LayoutPublico><Vitrine /></LayoutPublico>} />
        <Route path="/produto/:id"  element={<LayoutPublico><DetalhesProduto /></LayoutPublico>} />
        <Route path="/login"        element={<LayoutPublico><Login /></LayoutPublico>} />
        <Route path="/cadastro"     element={<LayoutPublico><Cadastro /></LayoutPublico>} />
        <Route path="/esqueci-senha" element={<LayoutPublico><EsqueciSenha /></LayoutPublico>} />
        <Route path="/meus-pedidos" element={<LayoutPublico><MeusPedidos /></LayoutPublico>} />

        {/* ✅ Fluxo de compra em 3 etapas */}
        <Route path="/carrinho"           element={<LayoutPublico><Carrinho /></LayoutPublico>} />
        <Route path="/checkout/endereco"  element={<LayoutPublico><CheckoutEndereco /></LayoutPublico>} />
        <Route path="/checkout/pagamento" element={<LayoutPublico><CheckoutPagamento /></LayoutPublico>} />

        {/* Categorias */}
        <Route path="/produtos"   element={<LayoutPublico><Produtos /></LayoutPublico>} />
        <Route path="/chas"       element={<LayoutPublico><Chas /></LayoutPublico>} />
        <Route path="/organicos"  element={<LayoutPublico><Organicos /></LayoutPublico>} />
        <Route path="/temperos"   element={<LayoutPublico><Temperos /></LayoutPublico>} />
        <Route path="/cosmeticos" element={<LayoutPublico><Cosmeticos /></LayoutPublico>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos"  element={<AdminProdutos />} />
          <Route path="pedidos"   element={<AdminPedidos />} />
          <Route path="usuarios"  element={<AdminUsuarios />} />
          <Route path="cupons"    element={<AdminCupons />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
