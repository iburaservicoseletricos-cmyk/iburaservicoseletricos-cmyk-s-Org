
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { User, ExamAttempt } from '../types';
import { ADMIN_PASSWORD, SUBJECTS } from '../constants';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartOptions
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Props {
  users: User[];
  history: ExamAttempt[];
  onUpdateUser: (user: User) => Promise<void>;
  onDeleteUser: (cpf: string) => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

const AdminLogin: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [password, setPassword] = useState('');
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onAuth();
    } else {
      alert("Senha de comando incorreta! Acesso negado.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl mt-12 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Quartel General</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Acesso Restrito ao Comando</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Senha de Comando</label>
          <input 
            required
            type="password"
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder:text-slate-600"
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-brand font-bold py-5 rounded-2xl transition-all shadow-xl shadow-yellow-500/10 uppercase tracking-widest active:scale-95"
        >
          AUTENTICAR ACESSO
        </button>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC<Props> = ({ users, history, onUpdateUser, onDeleteUser, onRefreshData }) => {
  const [msgTargetCpf, setMsgTargetCpf] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Garantir que os dados estejam frescos ao entrar
  useEffect(() => {
    if (onRefreshData) onRefreshData();
  }, []);

  const handleManualRefresh = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      await onRefreshData();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const chartStats = useMemo(() => {
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.length - active;
    
    const subjectAverages = SUBJECTS.map(s => {
      const filtered = history.filter(h => h.subject === s);
      if (filtered.length === 0) return { subject: s, avg: 0 };
      const sum = filtered.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
      return { subject: s, avg: (sum / filtered.length) * 100 };
    }).filter(item => item.avg > 0).sort((a,b) => b.avg - a.avg).slice(0, 7);

    const attemptsByDay: Record<string, number> = {};
    history.forEach(h => {
      const date = new Date(h.date).toLocaleDateString();
      attemptsByDay[date] = (attemptsByDay[date] || 0) + 1;
    });
    const engagementData = Object.entries(attemptsByDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7);

    return { active, inactive, subjectAverages, engagementData };
  }, [users, history]);

  const barData = {
    labels: chartStats.subjectAverages.map(s => s.subject),
    datasets: [{
      label: 'Média de Acertos (%)',
      data: chartStats.subjectAverages.map(s => s.avg),
      backgroundColor: 'rgba(234, 179, 8, 0.6)',
      borderColor: 'rgba(234, 179, 8, 1)',
      borderWidth: 1,
      borderRadius: 8,
    }]
  };

  const pieData = {
    labels: ['Ativos', 'Bloqueados'],
    datasets: [{
      data: [chartStats.active, chartStats.inactive],
      backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
      borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 1,
    }]
  };

  const lineData = {
    labels: chartStats.engagementData.map(d => d[0]),
    datasets: [{
      label: 'Simulados Realizados',
      data: chartStats.engagementData.map(d => d[1]),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      tension: 0.4,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
    }]
  };

  const commonOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#eab308',
        padding: 12,
        borderRadius: 12,
      }
    },
    scales: {
      y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
      x: { ticks: { color: '#64748b' }, grid: { display: false } }
    }
  };

  const handleToggleStatus = async (user: User) => {
    await onUpdateUser({
      ...user,
      status: user.status === 'active' ? 'inactive' : 'active'
    });
  };

  const handleSendMessage = async () => {
    if (!msgTargetCpf || !messageText.trim()) return;
    const user = users.find(u => u.cpf === msgTargetCpf);
    if (user) {
      const updatedUser = {
        ...user,
        messages: [...(user.messages || []), messageText.trim()]
      };
      await onUpdateUser(updatedUser);
      setMsgTargetCpf(null);
      setMessageText('');
      alert("Ordens transmitidas com sucesso!");
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h2 className="text-5xl font-display font-bold uppercase tracking-tighter text-white">Comando Central</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] italic">Monitoramento Estratégico em Tempo Real</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleManualRefresh}
            className={`p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Sincronizar Dados"
          >
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 text-xs font-bold uppercase tracking-widest shadow-xl">
             <span className="text-green-500 mr-2">{chartStats.active}</span> Ativos
          </div>
          <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 text-xs font-bold uppercase tracking-widest shadow-xl">
             <span className="text-red-500 mr-2">{chartStats.inactive}</span> Bloqueados
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl lg:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>
           <h3 className="font-display font-bold text-xl uppercase mb-8 flex items-center gap-3 text-slate-100">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
              </div>
              Top Desempenho por Matéria
           </h3>
           <div className="h-[300px]">
              {chartStats.subjectAverages.length > 0 ? (
                <Bar data={barData} options={commonOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 italic gap-4">
                  <div className="text-4xl opacity-20">📊</div>
                  Aguardando primeiras missões para gerar estatísticas.
                </div>
              )}
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
           <h3 className="font-display font-bold text-xl uppercase mb-8 flex items-center gap-3 text-slate-100">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              Distribuição da Tropa
           </h3>
           <div className="h-[300px]">
              <Pie data={pieData} options={{...commonOptions, scales: {}}} />
           </div>
        </div>
      </div>

      {/* Tabela de Gestão */}
      <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-10 py-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/30">
          <h3 className="font-display font-bold text-3xl flex items-center gap-4 text-white">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            Gestão da Tropa UP Cursos
          </h3>
          <div className="px-6 py-2 bg-slate-950/50 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total de Recrutas: {users.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/30">
                  <th className="px-10 py-6 text-[11px] font-bold uppercase text-slate-600 tracking-[0.2em]">Identificação / CPF</th>
                  <th className="px-10 py-6 text-[11px] font-bold uppercase text-slate-600 tracking-[0.2em]">Status Operacional</th>
                  <th className="px-10 py-6 text-[11px] font-bold uppercase text-slate-600 tracking-[0.2em]">QG / Concurso</th>
                  <th className="px-10 py-6 text-[11px] font-bold uppercase text-slate-600 tracking-[0.2em]">Ações de Comando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.cpf} className="hover:bg-slate-800/20 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {u.profilePicture ? (
                              <img src={u.profilePicture} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl opacity-20">👤</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 group-hover:text-yellow-500 transition-colors uppercase tracking-tight text-base">{u.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1 tracking-wider">{u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            u.status === 'active' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 group-hover:bg-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500/20'
                          }`}>
                            {u.status === 'active' ? '● Ativo' : '○ Bloqueado'}
                          </span>
                      </td>
                      <td className="px-10 py-6">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-tight bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">{u.examType}</span>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex gap-2">
                            <button 
                               onClick={() => handleToggleStatus(u)}
                               className={`p-3 rounded-xl transition-all border ${u.status === 'active' ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/40' : 'bg-green-950/20 border-green-900/30 text-green-400 hover:bg-green-900/40'}`}
                               title={u.status === 'active' ? "Bloquear Aluno" : "Desbloquear Aluno"}
                            >
                               {u.status === 'active' ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                               ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                               )}
                            </button>
                            
                            <button 
                               onClick={() => setMsgTargetCpf(u.cpf)}
                               className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700 shadow-lg"
                               title="Enviar Ordem Direta"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </button>

                            <button 
                               onClick={() => onDeleteUser(u.cpf)}
                               className="p-3 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-red-600 transition-all border border-red-600/30 shadow-lg"
                               title="Excluir Registro Permanente"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-30">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center animate-pulse">
                          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="text-xl font-display font-bold uppercase tracking-widest text-slate-500">Nenhum Recruta Alistado no Sistema</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Modal de Comunicação Tática */}
      {msgTargetCpf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-xl w-full shadow-2xl space-y-8 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-white">Comunicado Tático</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ordem Direta de Comando</p>
                 </div>
                 <button onClick={() => setMsgTargetCpf(null)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 transition-colors">&times;</button>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-slate-400">Destinatário: <span className="text-yellow-500 font-bold uppercase">{users.find(u => u.cpf === msgTargetCpf)?.name}</span></p>
              </div>

              <textarea 
                className="w-full h-48 bg-slate-800 border border-slate-700 rounded-2xl p-6 focus:outline-none focus:border-yellow-500 text-slate-200 resize-none font-medium text-lg placeholder:text-slate-600 shadow-inner"
                placeholder="Digite aqui as diretrizes operacionais..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              
              <div className="flex gap-4">
                 <button onClick={() => setMsgTargetCpf(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-bold uppercase text-xs transition-all tracking-widest text-slate-400">Abortar</button>
                 <button onClick={handleSendMessage} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-brand font-bold uppercase text-xs shadow-xl shadow-yellow-500/20 transition-all tracking-widest active:scale-95">Transmitir Ordens</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AdminArea: React.FC<Props> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <AdminDashboard {...props} /> 
            : <Navigate to="login" replace />
        } 
      />
      <Route 
        path="login" 
        element={
          <AdminLogin onAuth={() => {
            setIsAuthenticated(true);
            navigate('/admin');
          }} />
        } 
      />
    </Routes>
  );
};

export default AdminArea;
