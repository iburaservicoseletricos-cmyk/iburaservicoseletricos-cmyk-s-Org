
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { User, ExamAttempt } from './types';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminArea from './components/AdminArea';
import ExamSimulator from './components/ExamSimulator';
import Logo from './components/Logo';
import Footer from './components/Footer';
import { dbService } from './services/dbService';

const AppContent: React.FC<{
  users: User[];
  examHistory: ExamAttempt[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onRegister: (user: User) => Promise<boolean>;
  onLogin: (cpf: string) => Promise<boolean>;
  onSaveResult: (result: ExamAttempt) => Promise<void>;
  onUpdateUser: (user: User) => Promise<void>;
  onDeleteUser: (cpf: string) => Promise<void>;
  onDeleteAttempt: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
}> = ({ users, examHistory, currentUser, setCurrentUser, onRegister, onLogin, onSaveResult, onUpdateUser, onDeleteUser, onDeleteAttempt, onRefreshData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && (location.pathname === '/login' || location.pathname === '/cadastro')) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('up_cursos_active_cpf');
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-yellow-500 selection:text-black">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <Logo className="scale-50 -ml-8" showSubtitle={true} />
          </div>

          <div className="flex gap-2 sm:gap-4 items-center">
            {!currentUser ? (
              <>
                <button 
                  onClick={() => navigate('/cadastro')} 
                  className="text-[10px] sm:text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all uppercase tracking-tighter shadow-lg shadow-yellow-500/10"
                >
                  Cadastro
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-[10px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all border border-slate-700 uppercase tracking-tighter"
                >
                  Área do Aluno
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Recruta Online</span>
                  <span className="text-xs text-slate-400 font-bold uppercase">{currentUser.name.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold bg-red-950/30 text-red-400 hover:bg-red-950/50 px-4 py-2 rounded-lg transition-colors border border-red-900/30 uppercase"
                >
                  Sair
                </button>
              </div>
            )}
            <button 
              onClick={() => navigate('/admin')} 
              className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-[0.2em] ml-2"
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <Routes>
          <Route path="/" element={<LandingPage onStart={() => navigate('/cadastro')} />} />
          <Route path="/cadastro" element={<Register onRegister={onRegister} onSwitchToLogin={() => navigate('/login')} />} />
          <Route path="/login" element={<Login onLogin={onLogin} onSwitchToRegister={() => navigate('/cadastro')} />} />
          
          <Route 
            path="/dashboard" 
            element={currentUser ? (
              <StudentDashboard 
                user={currentUser} 
                history={examHistory.filter(h => h.userCpf === currentUser.cpf)} 
                onStartExam={(subject) => navigate(`/simulado/${encodeURIComponent(subject)}`)}
                onUpdateUser={onUpdateUser}
                onDeleteAttempt={onDeleteAttempt}
              />
            ) : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/simulado/:subject" 
            element={currentUser ? (
              <ExamSimulator 
                user={currentUser} 
                onFinish={onSaveResult} 
              />
            ) : <Navigate to="/login" replace />} 
          />

          <Route 
            path="/admin/*" 
            element={
              <AdminArea 
                users={users} 
                history={examHistory} 
                onUpdateUser={onUpdateUser}
                onDeleteUser={onDeleteUser}
                onRefreshData={onRefreshData}
              />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <a 
        href="https://wa.me/+5581973224504" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[60] group flex items-center gap-3 animate-float-slow"
        aria-label="Teleatendimento via WhatsApp"
      >
        <div className="absolute right-0 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-slate-800 opacity-0 group-hover:opacity-100 group-hover:-translate-x-16 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl">
          Falar com o Comando
        </div>
        <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 transform group-hover:scale-110 active:scale-95">
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396 0 12.032c0 2.12.554 4.189 1.602 6.056L0 24l6.117-1.605a11.803 11.803 0 005.925 1.585h.005c6.635 0 12.032-5.396 12.035-12.032a11.77 11.77 0 00-3.53-8.413z" />
          </svg>
        </div>
      </a>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [examHistory, setExamHistory] = useState<ExamAttempt[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const storedUsers = await dbService.getAllUsers();
      const storedHistory = await dbService.getAllHistory();
      setUsers([...storedUsers]);
      setExamHistory([...storedHistory]);
      return { storedUsers, storedHistory };
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      return { storedUsers: [], storedHistory: [] };
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      await dbService.init();
      const { storedUsers } = await loadData();
      
      const savedCpf = localStorage.getItem('up_cursos_active_cpf');
      if (savedCpf) {
        const user = storedUsers.find(u => u.cpf === savedCpf);
        if (user && user.status === 'active') {
          setCurrentUser(user);
        }
      }
      setIsDbReady(true);
    };
    initApp();
  }, [loadData]);

  const handleRegister = async (newUser: User): Promise<boolean> => {
    try {
      await dbService.saveUser(newUser);
      await loadData();
      localStorage.setItem('up_cursos_active_cpf', newUser.cpf);
      setCurrentUser(newUser);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogin = async (cpf: string): Promise<boolean> => {
    const all = await dbService.getAllUsers();
    const user = all.find(u => u.cpf === cpf);
    if (user && user.status === 'active') {
      localStorage.setItem('up_cursos_active_cpf', user.cpf);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleSaveResult = async (result: ExamAttempt) => {
    await dbService.saveExamAttempt(result);
    if (currentUser) {
      const updatedProgress = { ...(currentUser.progress || {}) };
      updatedProgress[result.subject] = (updatedProgress[result.subject] || 0) + result.total;
      const updatedUser = { 
        ...currentUser, 
        progress: updatedProgress,
        totalStudyTimeSeconds: (currentUser.totalStudyTimeSeconds || 0) + result.timeSpentSeconds
      };
      await dbService.saveUser(updatedUser);
      await loadData();
      setCurrentUser(updatedUser);
    }
  };

  const handleUpdateUser = async (user: User) => {
    await dbService.saveUser(user);
    await loadData();
    if (currentUser?.cpf === user.cpf) setCurrentUser(user);
  };

  const handleDeleteUser = async (cpf: string) => {
    await dbService.deleteUser(cpf);
    await dbService.deleteUserHistory(cpf);
    await loadData();
    if (currentUser?.cpf === cpf) {
      localStorage.removeItem('up_cursos_active_cpf');
      setCurrentUser(null);
    }
  };

  const handleDeleteAttempt = async (id: string) => {
    await dbService.deleteExamAttempt(id);
    await loadData();
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Logo className="mb-4 scale-110" />
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent 
        users={users}
        examHistory={examHistory}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onRegister={handleRegister}
        onLogin={handleLogin}
        onSaveResult={handleSaveResult}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onDeleteAttempt={handleDeleteAttempt}
        onRefreshData={loadData}
      />
    </HashRouter>
  );
};

export default App;
