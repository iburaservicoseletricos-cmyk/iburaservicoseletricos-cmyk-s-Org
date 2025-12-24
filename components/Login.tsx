
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLogin: (cpf: string) => Promise<boolean>;
  onSwitchToRegister: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para aplicar máscara de CPF (000.000.000-00)
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length < 11) {
      alert("Por favor, informe seu CPF completo (11 números).");
      return;
    }
    
    setLoading(true);
    try {
      const success = await onLogin(cleanCpf);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-white">Acesso do Aluno</h2>
        <div className="h-1 w-12 bg-yellow-500 mx-auto rounded-full mt-2"></div>
      </div>
      
      <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed">
        Digite seu <span className="text-yellow-500 font-bold">CPF</span> para carregar seu progresso vitalício e simulados.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Documento de Identificação (CPF)</label>
          <input 
            required
            disabled={loading}
            type="text"
            inputMode="numeric"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xl tracking-widest focus:outline-none focus:border-yellow-500 transition-colors text-white placeholder:text-slate-700 font-mono disabled:opacity-50"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleChange}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-brand text-lg py-5 rounded-xl transition-all shadow-lg shadow-yellow-500/10 active:scale-95 font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              AUTENTICANDO...
            </>
          ) : 'ENTRAR NA ÁREA DO ALUNO'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
        <p className="text-slate-500 text-sm">
          Ainda não tem cadastro? <button onClick={onSwitchToRegister} className="text-yellow-500 font-bold hover:underline uppercase tracking-widest text-xs ml-1">Cadastrar agora</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
