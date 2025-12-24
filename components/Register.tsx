
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { CONCURSOS } from '../constants';

interface Props {
  onRegister: (user: User) => Promise<boolean>;
  onSwitchToLogin: () => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const Register: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: 'PE',
    cpf: '',
    examType: CONCURSOS.SEGURANCA_PUBLICA[0],
    profilePicture: ''
  });

  // Função para aplicar máscara de CPF (000.000.000-00)
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Recruta, a imagem é muito grande! Tente uma foto de até 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = formData.cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      alert("O CPF deve conter exatamente 11 dígitos numéricos.");
      return;
    }

    setIsSubmitting(true);
    const success = await onRegister({
      ...formData,
      cpf: cleanCpf,
      joinedAt: new Date().toISOString(),
      status: 'active'
    } as User);
    
    setIsSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-white">Alistamento Militar</h2>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Crie sua Identidade Tática Permanente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload de Foto no Cadastro */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div 
            className="w-24 h-24 bg-slate-800 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden hover:border-yellow-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[8px] font-bold uppercase mt-1">Foto</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange}
          />
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Toque para adicionar foto (Opcional)</p>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nome de Guerra Completo</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors text-white disabled:opacity-50"
            placeholder="Ex: João da Silva"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Telefone / WhatsApp</label>
            <input 
              required
              disabled={isSubmitting}
              type="tel"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors text-white disabled:opacity-50"
              placeholder="(81) 90000-0000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Estado (UF)</label>
            <select 
              disabled={isSubmitting}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors appearance-none text-white cursor-pointer disabled:opacity-50"
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
            >
              {BRAZILIAN_STATES.map(st => <option key={st} value={st} className="bg-slate-900">{st}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail Operacional</label>
          <input 
            required
            disabled={isSubmitting}
            type="email"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors text-white disabled:opacity-50"
            placeholder="contato@exemplo.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">CPF (Seu Login Vitalício)</label>
          <input 
            required
            disabled={isSubmitting}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors text-white tracking-[0.2em] font-mono disabled:opacity-50"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleCpfChange}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Foco de Combate</label>
          <select 
            disabled={isSubmitting}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:outline-none focus:border-yellow-500 transition-colors appearance-none text-white cursor-pointer disabled:opacity-50"
            value={formData.examType}
            onChange={e => setFormData({...formData, examType: e.target.value})}
          >
            {Object.values(CONCURSOS).flat().map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-brand text-lg py-5 rounded-xl mt-4 transition-all active:scale-95 font-bold uppercase shadow-xl shadow-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              PROCESSANDO...
            </>
          ) : 'EFETUAR ALISTAMENTO'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
        <p className="text-slate-500 text-sm">
          Já faz parte da tropa? <button onClick={onSwitchToLogin} className="text-yellow-500 font-bold hover:underline uppercase tracking-widest text-xs">Acessar Área do Aluno</button>
        </p>
      </div>
    </div>
  );
};

export default Register;
