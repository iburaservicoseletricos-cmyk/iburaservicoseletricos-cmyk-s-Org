
import React, { useEffect, useState, useRef } from 'react';
import { User, ExamAttempt } from '../types';
import { SUBJECTS, QUESTIONS_PER_SUBJECT_GOAL, CONCURSOS } from '../constants';
import { generatePerformanceAnalysis } from '../services/geminiService';

interface Props {
  user: User;
  history: ExamAttempt[];
  onStartExam: (subject: string) => void;
  onUpdateUser?: (user: User) => Promise<void>;
  onDeleteAttempt?: (id: string) => Promise<void>;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const getSubjectIcon = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('português')) return '📝';
  if (s.includes('redação')) return '✍️';
  if (s.includes('matemática')) return '🔢';
  if (s.includes('raciocínio')) return '🧠';
  if (s.includes('constitucional')) return '⚖️';
  if (s.includes('administrativo')) return '🏢';
  if (s.includes('penal militar')) return '🎖️';
  if (s.includes('penal')) return '👮';
  if (s.includes('processual')) return '⚖️';
  if (s.includes('humanos')) return '🤝';
  if (s.includes('legislação especial')) return '📜';
  if (s.includes('trânsito')) return '🚗';
  if (s.includes('ética')) return '🛡️';
  if (s.includes('informática')) return '💻';
  if (s.includes('história')) return '🏛️';
  if (s.includes('geografia')) return '🌍';
  if (s.includes('geopolítica')) return '🗺️';
  if (s.includes('física')) return '⚛️';
  if (s.includes('química')) return '🧪';
  if (s.includes('biologia')) return '🧬';
  if (s.includes('inglês')) return '🇺🇸';
  if (s.includes('espanhol')) return '🇪🇸';
  if (s.includes('contabilidade')) return '📊';
  if (s.includes('estatística')) return '📉';
  if (s.includes('administração')) return '👔';
  if (s.includes('criminologia')) return '🔍';
  if (s.includes('medicina legal')) return '🩺';
  if (s.includes('arquivologia')) return '📁';
  if (s.includes('atualidades')) return '📰';
  return '🎯';
};

const StudentDashboard: React.FC<Props> = ({ user, history, onStartExam, onUpdateUser, onDeleteAttempt }) => {
  const [activeTab, setActiveTab] = useState<'simulados' | 'perfil' | 'historico'>('simulados');
  const [analysis, setAnalysis] = useState<string>('Processando dados táticos...');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State para edição de perfil
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    state: user.state || 'PE',
    examType: user.examType,
    profilePicture: user.profilePicture || ''
  });

  useEffect(() => {
    if (history.length > 0) {
      generatePerformanceAnalysis(history).then(setAnalysis);
    } else {
      setAnalysis('Realize seu primeiro simulado para que nossa inteligência artificial trace seu perfil tático de combate.');
    }
  }, [history]);

  const totalScore = history.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
  const averageAccuracy = history.length > 0 ? (totalScore / history.length) * 100 : 0;
  
  const totalSeconds = history.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
  const formatTotalTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (hours === 0) return `${mins}m de combate`;
    return `${hours}h ${mins}m de combate`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Arquivo muito pesado, recruta! O limite é 2MB para manter a agilidade do sistema.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      await onUpdateUser({
        ...user,
        ...editData
      });
      alert("Identidade tática atualizada com sucesso, soldado!");
    }
  };

  const handleShareSubject = async (e: React.MouseEvent, subject: string, completed: number) => {
    e.stopPropagation();
    const progressPercent = Math.min((completed / QUESTIONS_PER_SUBJECT_GOAL) * 100, 100).toFixed(1);
    const shareText = `Recruta ${user.name.split(' ')[0]} em combate! 🎖️\n\nSetor: ${subject}\nProntidão: ${progressPercent}% concluída rumo às ${QUESTIONS_PER_SUBJECT_GOAL} questões.\n\nEstude comigo na UP Cursos - Nordeste EAD! 🛡️`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Progresso Tático',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Relatório de progresso copiado para a área de transferência!");
    }
  };

  const filteredHistory = history
    .filter(h => filterSubject === 'all' || h.subject === filterSubject)
    .filter(h => {
      const term = searchTerm.toLowerCase();
      const dateStr = new Date(h.date).toLocaleDateString();
      return (
        h.subject.toLowerCase().includes(term) ||
        (h.examName && h.examName.toLowerCase().includes(term)) ||
        dateStr.includes(term)
      );
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Tático */}
      <header className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500/30 overflow-hidden bg-slate-800 shadow-2xl flex-shrink-0">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Foto de Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">👤</div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-900 text-xs font-bold">
                ✓
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-brand font-bold text-yellow-500 uppercase tracking-widest">Acesso de Elite Confirmado</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                  Recruta <span className="text-yellow-500 uppercase">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-400 mt-1 font-medium">
                  Alocado no QG: <span className="text-slate-200 border-b border-yellow-500/30">{user.examType}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 min-w-[120px] text-center transform hover:scale-105 transition-transform">
              <div className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Simulados</div>
              <div className="text-2xl font-display font-bold text-white">{history.length}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 min-w-[120px] text-center transform hover:scale-105 transition-transform">
              <div className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Aproveitamento</div>
              <div className="text-2xl font-display font-bold text-yellow-500">{averageAccuracy.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-3xl border border-slate-700/50 min-w-[120px] text-center transform hover:scale-105 transition-transform">
              <div className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Horas de Estudo</div>
              <div className="text-2xl font-display font-bold text-green-500">{formatTotalTime(totalSeconds)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu de Navegação */}
      <nav className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl sticky top-24 z-40 shadow-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('simulados')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'simulados' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          Módulos de Estudo
        </button>
        <button 
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'historico' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          Histórico de Missões
        </button>
        <button 
          onClick={() => setActiveTab('perfil')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'perfil' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          Meus Dados / Perfil
        </button>
      </nav>

      {/* Conteúdo das Abas */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {activeTab === 'simulados' && (
          <div className="space-y-12">
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-slate-800 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 p-8 rounded-[2rem] border border-slate-800/50 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="space-y-1 flex-grow">
                  <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em]">Analista Tático de IA</h3>
                  <p className="text-slate-300 leading-relaxed text-base italic font-medium">"{analysis}"</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-4">
                Setores Operacionais Disponíveis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {SUBJECTS.map((subject) => {
                  const icon = getSubjectIcon(subject);
                  const completed = user.progress?.[subject] || 0;
                  const progressPercent = Math.min((completed / QUESTIONS_PER_SUBJECT_GOAL) * 100, 100);
                  
                  return (
                    <div 
                      key={subject}
                      onClick={() => onStartExam(subject)}
                      className="group relative h-80 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-yellow-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col p-6 shadow-lg hover:shadow-yellow-500/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-3xl bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-slate-700/50 group-hover:border-yellow-500/30">
                          {icon}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={(e) => handleShareSubject(e, subject, completed)}
                            className="bg-slate-800 hover:bg-yellow-500 p-2 rounded-lg text-slate-400 hover:text-black transition-all border border-slate-700"
                            title="Compartilhar Progresso"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.368 3 3 0 000 5.368zm0 9.368a3 3 0 100-5.368 3 3 0 000 5.368z" />
                            </svg>
                          </button>
                          <div className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700/50">
                            {completed} / {QUESTIONS_PER_SUBJECT_GOAL} <span className="text-slate-600 ml-1">Q</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-display text-lg font-bold text-slate-100 group-hover:text-yellow-500 transition-colors uppercase tracking-tight leading-tight">
                          {subject}
                        </h4>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wider font-bold group-hover:text-slate-300 transition-colors">Acessar Simulado Especializado</p>
                      </div>
                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-800/50">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-500">Prontidão de Combate</span>
                          <span className={`${progressPercent >= 100 ? 'text-green-500' : 'text-yellow-500'}`}>{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/30">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`} 
                            style={{ width: `${progressPercent}%` }}
                          >
                             {progressPercent > 10 && (
                               <div className="w-full h-full bg-white/20 animate-pulse"></div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="flex flex-col items-center gap-6 pb-8 border-b border-slate-800">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-800 rounded-full flex items-center justify-center text-4xl border-4 border-slate-700 overflow-hidden relative">
                    {editData.profilePicture ? (
                      <img src={editData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-600">👤</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-yellow-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Alterar Foto</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{user.name}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Recruta desde {new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome de Guerra</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Seguro</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={editData.email}
                      onChange={e => setEditData({...editData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                    <input 
                      type="tel" 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={editData.phone}
                      onChange={e => setEditData({...editData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Estado (UF)</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-yellow-500 transition-colors appearance-none cursor-pointer"
                      value={editData.state}
                      onChange={e => setEditData({...editData, state: e.target.value})}
                    >
                      {BRAZILIAN_STATES.map(st => <option key={st} value={st} className="bg-slate-900">{st}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">CPF (Inalterável)</label>
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-500 cursor-not-allowed opacity-60 font-mono tracking-widest"
                    value={user.cpf}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Foco de Combate (Concurso)</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-yellow-500 transition-colors appearance-none cursor-pointer"
                    value={editData.examType}
                    onChange={e => setEditData({...editData, examType: e.target.value})}
                  >
                    {Object.values(CONCURSOS).flat().map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-brand font-bold py-5 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 uppercase tracking-widest mt-4"
                >
                  SALVAR IDENTIDADE VISUAL
                </button>
              </form>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-3xl text-center">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Área Sensível</p>
              <p className="text-slate-500 text-xs mb-4">Caso precise trocar de CPF ou encerrar sua conta, entre em contato com o Comando Central (Admin).</p>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
              <h2 className="text-2xl font-display font-bold uppercase tracking-tight border-l-4 border-yellow-500 pl-4">Log de Missões Operacionais</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow min-w-[280px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input 
                    type="text"
                    placeholder="Buscar por matéria, data ou concurso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all placeholder:text-slate-600"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <select 
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-slate-400 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer"
                >
                  <option value="all">TODOS OS SETORES</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/40">
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Data Estelar</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Setor / Matéria</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Resultado Tático</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Tempo Operacional</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.slice().reverse().map((h, i) => {
                        const ratio = h.score / h.total;
                        const isPass = ratio >= 0.7;
                        const mins = Math.floor((h.timeSpentSeconds || 0) / 60);
                        const secs = (h.timeSpentSeconds || 0) % 60;
                        return (
                          <tr key={h.id || i} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-8 py-6 text-xs text-slate-400 font-mono">
                              {new Date(h.date).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-bold text-slate-100 uppercase tracking-tight group-hover:text-yellow-500 transition-colors">{h.subject}</div>
                              {h.examName && (
                                <div className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-widest">{h.examName}</div>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className={`text-sm font-display font-bold ${isPass ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {h.score} / {h.total} ACERTOS
                                  </span>
                                  <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div 
                                      className={`h-full ${isPass ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                      style={{ width: `${(h.score/h.total)*100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${isPass ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                  {isPass ? 'APROVADO' : 'TREINO'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                              {mins}m {secs}s
                            </td>
                            <td className="px-8 py-6">
                              <button 
                                onClick={() => onDeleteAttempt && onDeleteAttempt(h.id)}
                                className="p-2.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all border border-red-600/20 flex items-center justify-center group/del"
                                title="Excluir Resultado"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-4xl opacity-20">📡</div>
                            <p className="text-slate-600 font-medium italic">
                              {searchTerm ? `Nenhuma missão encontrada para "${searchTerm}"` : 'Aguardando início das operações no campo de batalha...'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
