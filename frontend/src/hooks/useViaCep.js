import { useState } from 'react';

export function useViaCep() {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep,     setErroCep]     = useState('');

  async function buscarCep(cep, onSucesso) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    setErroCep('');

    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErroCep('CEP não encontrado.');
        return;
      }

      onSucesso({
        logradouro: data.logradouro || '',
        bairro:     data.bairro     || '',
        cidade:     data.localidade || '',
        estado:     data.uf         || '',
      });
    } catch {
      setErroCep('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setBuscandoCep(false);
    }
  }

  // Formata CEP enquanto o usuário digita: 01310-100
  function formatarCep(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  }

  return { buscarCep, buscandoCep, erroCep, formatarCep };
}
