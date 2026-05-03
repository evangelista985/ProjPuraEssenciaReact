import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [cliente, setCliente] = useState(null);
  const [admin,   setAdmin]   = useState(null);

  useEffect(() => {
    const c = localStorage.getItem('cliente');
    const a = localStorage.getItem('admin');
    if (c) setCliente(JSON.parse(c));
    if (a) setAdmin(JSON.parse(a));
  }, []);

  function loginCliente(token, dados) {
    localStorage.setItem('token',   token);
    localStorage.setItem('cliente', JSON.stringify(dados));
    localStorage.removeItem('admin');
    setCliente(dados);
    setAdmin(null);
  }

  function loginAdmin(token, dados) {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(dados));
    localStorage.removeItem('cliente');
    setAdmin(dados);
    setCliente(null);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('cliente');
    localStorage.removeItem('admin');
    setCliente(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ cliente, admin, loginCliente, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
