import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionar(produto, quantidade = 1) {
    setItens(prev => {
      const existe = prev.find(i => i.produto_id === produto.id);
      if (existe) {
        return prev.map(i =>
          i.produto_id === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...prev, {
        produto_id: produto.id,
        nome:       produto.nome,
        preco:      produto.preco,
        imagem:     produto.imagem,
        quantidade,
      }];
    });
  }

  function remover(produto_id) {
    setItens(prev => prev.filter(i => i.produto_id !== produto_id));
  }

  function atualizarQtd(produto_id, quantidade) {
    if (quantidade <= 0) return remover(produto_id);
    setItens(prev => prev.map(i => i.produto_id === produto_id ? { ...i, quantidade } : i));
  }

  function limpar() { setItens([]); }

  const total      = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ itens, adicionar, remover, atualizarQtd, limpar, total, totalItens }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
