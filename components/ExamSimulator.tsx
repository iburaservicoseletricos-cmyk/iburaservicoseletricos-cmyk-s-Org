
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Question, ExamAttempt } from '../types';
import { generateQuestions } from '../services/geminiService';

interface Props {
  user: User;
  onFinish: (result: ExamAttempt) => Promise<void>;
}

const ExamSimulator: React.FC<Props> = ({ user, onFinish }) => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const decodedSubject = decodeURIComponent(subject || '');
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [totalQuestionsFetched, setTotalQuestionsFetched] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  // Função para carregar mais questões em background
  const fetchMoreQuestions = useCallback(async (offset: number) => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setFetchingMore(true);
    
    try {
      const newBatch = await generateQuestions(decodedSubject, user.examType, offset);
      if (newBatch && newBatch.length > 0) {
        setQuestions(prev => [...prev, ...newBatch]);
        setTotalQuestionsFetched(prev => prev + newBatch.length);
      }
    } catch (error) {
      console.error("Erro ao pré-carregar questões:", error);
    } finally {
      setFetchingMore(false);
      isFetchingRef.current = false;
    }
  }, [decodedSubject, user.examType]);

  // Efeito Inicial
  useEffect(() => {
    if (!decodedSubject) {
      navigate('/dashboard');
      return;
    }

    const initialOffset = user.progress?.[decodedSubject] || 0;
    
    const loadInitial = async () => {
      const data = await generateQuestions(decodedSubject, user.examType, initialOffset);
      setQuestions(data);
      setTotalQuestionsFetched(initialOffset + data.length);
      setLoadingInitial(false);
      
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    };

    loadInitial();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [decodedSubject, user.examType, navigate]);

  // Lógica de Pre-fetching: Quando chegar perto do fim das questões atuais, carrega mais
  useEffect(() => {
    const questionsRemaining = questions.length - currentIdx;
    // Se faltarem menos de 4 questões e não estivermos buscando, busca mais 10
    if (questionsRemaining <= 4 && questions.length > 0 && !isFetchingRef.current && !finished) {
      fetchMoreQuestions(totalQuestionsFetched);
    }
  }, [currentIdx, questions.length, totalQuestionsFetched, fetchMoreQuestions, finished]);

  const handleSelect = (idx: number) => {
    if (finished) return;
    setAnswers({ ...answers, [currentIdx]: idx });
  };

  const calculateScore = () => {
    let score = 0;
    // Só calculamos até a última questão que o usuário efetivamente respondeu ou visualizou
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
  };

  const handleFinishSave = async () => {
    const score = calculateScore();
    // Apenas as questões que foram respondidas contam para o total do progresso
    const answeredCount = Object.keys(answers).length;
    
    await onFinish({
      id: Date.now().toString(),
      userCpf: user.cpf,
      subject: decodedSubject,
      score,
      total: answeredCount || 1, 
      date: new Date().toISOString(),
      examName: user.examType,
      timeSpentSeconds: seconds
    });
    navigate('/dashboard');
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-yellow-500">Iniciando Protocolo</h2>
          <p className="text-slate-500 mt-2 font-medium">Conectando ao banco de dados tático: {decodedSubject}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-40 bg-slate-900 rounded-[3rem] border border-slate-800">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Falha na Extração de Dados</h2>
        <p className="text-slate-500 mb-8">Não foi possível gerar questões para este setor no momento.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest">Retornar à Base</button>
      </div>
    );
  }

  const q = questions[currentIdx];

  if (finished) {
    const score = calculateScore();
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-800 text-center space-y-8 animate-in zoom-in duration-500 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-block bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Relatório de Pós-Combate</div>
          <h2 className="text-5xl font-display font-bold uppercase text-white">Missão Concluída</h2>
          <p className="text-slate-500 text-lg font-medium tracking-tight">{decodedSubject}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 py-8">
          <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
            <div className="text-4xl md:text-5xl font-display font-bold text-yellow-500">{score}</div>
            <div className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-2">Acertos</div>
          </div>
          <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
            <div className="text-4xl md:text-5xl font-display font-bold text-slate-400">{answeredCount}</div>
            <div className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-2">Resolvidas</div>
          </div>
          <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
            <div className="text-2xl md:text-3xl font-display font-bold text-green-500 mt-2">{formatTime(seconds)}</div>
            <div className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-4">Tempo</div>
          </div>
        </div>

        <div className="space-y-4 text-left bg-slate-950/30 p-6 rounded-[2rem] border border-slate-800/50 max-h-80 overflow-y-auto custom-scrollbar">
          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-3 flex items-center gap-2">
             <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Análise Detalhada
          </h3>
          {questions.slice(0, currentIdx + 1).map((item, i) => (
            answers[i] !== undefined && (
              <div key={i} className={`p-5 rounded-2xl mb-3 ${answers[i] === item.correctAnswer ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Questão {i+1}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${answers[i] === item.correctAnswer ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {answers[i] === item.correctAnswer ? 'ALVO ATINGIDO' : 'ALVO PERDIDO'}
                  </span>
                </div>
                <p className="text-slate-200 text-sm mb-3 font-medium">{item.text}</p>
                <div className="bg-slate-900/50 p-4 rounded-xl text-[11px] text-slate-400 italic leading-relaxed border border-slate-800">
                  <span className="text-yellow-500 font-bold not-italic uppercase block mb-1">Debriefing:</span>
                  {item.explanation}
                </div>
              </div>
            )
          ))}
        </div>

        <button 
          onClick={handleFinishSave}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-brand font-bold py-5 rounded-2xl transition-all shadow-xl shadow-yellow-500/10 uppercase tracking-widest text-lg"
        >
          SALVAR RESULTADO E VOLTAR AO QG
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* HUD de Combate */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
             <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Operação Ativa</span>
          </div>
          <span className="text-white font-display font-bold text-2xl uppercase tracking-tight">{decodedSubject}</span>
        </div>

        <div className="flex items-center gap-4">
          {fetchingMore && (
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-yellow-500/20 animate-pulse">
               <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">Sincronizando Dados...</span>
            </div>
          )}
          
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-[1.5rem] flex items-center gap-6 shadow-2xl backdrop-blur-md">
             <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Progresso</span>
                <span className="text-white font-display font-bold text-lg">{currentIdx + 1}</span>
             </div>
             <div className="w-px h-8 bg-slate-800"></div>
             <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Cronômetro</span>
                <span className="text-yellow-500 font-mono font-bold text-lg">{formatTime(seconds)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Área da Questão */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl space-y-10 min-h-[550px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-yellow-500 transition-all duration-500" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">Enunciado Tático</span>
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">{q.text}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-5 group relative overflow-hidden ${
                  answers[currentIdx] === i 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 transition-colors ${
                  answers[currentIdx] === i ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="mt-1.5 font-medium md:text-lg leading-snug">{opt}</span>
                {answers[currentIdx] === i && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 opacity-20">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controles de Navegação */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-slate-800/50">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex-1 sm:flex-none px-8 py-4 rounded-xl font-bold text-slate-500 hover:text-white transition-colors disabled:opacity-30 border border-transparent hover:border-slate-800 uppercase text-xs tracking-widest"
            >
              ANTERIOR
            </button>
            <button 
              onClick={handleFinish}
              className="flex-1 sm:flex-none px-8 py-4 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/40 rounded-xl font-bold uppercase text-xs tracking-widest transition-all"
            >
              ENCERRAR
            </button>
          </div>

          <button 
            disabled={answers[currentIdx] === undefined && currentIdx >= questions.length - 1}
            onClick={() => {
              if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
              } else if (fetchingMore) {
                // Caso o aluno seja muito rápido, aguarda o pre-fetch
                alert("Aguarde um instante, carregando mais munição tática...");
              }
            }}
            className={`w-full sm:w-auto px-12 py-4 rounded-xl font-brand font-bold uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              currentIdx < questions.length - 1 
              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/10' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {currentIdx < questions.length - 1 ? (
              <>PRÓXIMA QUESTÃO <span className="text-xl">&rarr;</span></>
            ) : (
              'AGUARDANDO DADOS...'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSimulator;
