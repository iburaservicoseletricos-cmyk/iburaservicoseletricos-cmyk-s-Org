
import React, { useRef } from 'react';
import Logo from './Logo';
import { SUBJECTS, TESTIMONIALS } from '../constants';

interface Props {
  onStart: () => void;
}

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

const LandingPage: React.FC<Props> = ({ onStart }) => {
  const subjectsRef = useRef<HTMLDivElement>(null);

  const scrollToSubjects = () => {
    subjectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center py-10 md:py-20 space-y-32">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-12 w-full">
        <div className="animate-in fade-in slide-in-from-top duration-1000">
          <Logo className="scale-125 md:scale-150 mb-8" />
        </div>

        <div className="max-w-4xl space-y-6">
          <div className="inline-block bg-yellow-500 text-black font-brand px-6 py-2 rounded-full text-sm md:text-lg mb-4 shadow-xl shadow-yellow-500/20 animate-pulse uppercase tracking-[0.2em]">
            SEJA APROVADO EM 2026
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tight text-white leading-[1.1]">
            Sua Aprovação é a Nossa <br/>
            <span className="text-yellow-500 underline decoration-4 underline-offset-8">Missão</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A plataforma oficial de simulados da <b>UP CURSOS - Nordeste EAD</b>. 
            Preparação de elite para Segurança Pública e Forças Armadas com IA de última geração.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-4 w-full justify-center px-4">
          <button 
            onClick={onStart}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-brand text-xl py-5 px-12 rounded-xl shadow-2xl shadow-yellow-500/20 transition-all transform hover:scale-105 active:scale-95 font-bold uppercase"
          >
            ALISTAR-SE AGORA
          </button>
          <button 
            onClick={scrollToSubjects}
            className="bg-slate-800 hover:bg-slate-700 text-white font-brand text-xl py-5 px-12 rounded-xl border border-slate-700 transition-all transform hover:scale-105 active:scale-95 font-bold uppercase"
          >
            VER MATÉRIAS
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 w-full max-w-5xl px-4">
          {[
            { label: 'Matérias', val: 'Completo' },
            { label: 'EAD', val: 'Nordeste' },
            { label: 'IA Integrada', val: 'Ativa' },
            { label: 'Acesso', val: 'Vitalício' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
              <div className="text-2xl font-display font-bold text-yellow-500 group-hover:scale-110 transition-transform">{stat.val}</div>
              <div className="text-slate-500 text-[0.65rem] uppercase tracking-[0.2em] mt-2 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Wall of Love */}
      <section className="w-full max-w-7xl px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Base de Alunos Satisfeitos</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-white tracking-tight">Mural de Honra</h2>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full"></div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            O que dizem os nossos recrutas espalhados por todo o Brasil que já estão no caminho da farda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl hover:border-yellow-500/40 hover:bg-slate-800/40 transition-all group flex flex-col space-y-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-2 py-1 rounded border border-slate-800 uppercase tracking-widest">{t.state}</span>
              </div>
              
              <p className="text-slate-300 text-sm italic leading-relaxed flex-grow">
                "{t.comment}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-display font-bold text-yellow-500 border border-slate-700">
                  {t.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm uppercase tracking-tight">{t.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Recruta Confirmado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects Section */}
      <section ref={subjectsRef} className="w-full max-w-7xl px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-white tracking-tight">Grade Curricular de Elite</h2>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full"></div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore todas as disciplinas inclusas em nosso banco de dados massivo. 
            Mais de <span className="text-yellow-500 font-bold">1.000 questões por matéria</span> focadas na sua aprovação.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {SUBJECTS.map((subject, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-yellow-500/30 hover:bg-slate-800/50 transition-all group flex flex-col items-center text-center gap-4"
            >
              <div className="text-3xl bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                {getSubjectIcon(subject)}
              </div>
              <h3 className="text-slate-200 font-bold text-sm leading-tight uppercase tracking-tight group-hover:text-yellow-500 transition-colors">
                {subject}
              </h3>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 text-center space-y-6">
          <h4 className="text-2xl font-display font-bold text-yellow-500 uppercase italic">Pronto para o Combate?</h4>
          <p className="text-slate-400 max-w-xl mx-auto">
            Não perca tempo. O cronômetro do concurso já está rodando. Comece agora sua preparação tática com a UP Cursos.
          </p>
          <button 
            onClick={onStart}
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-brand font-bold py-4 px-10 rounded-xl transition-all shadow-xl shadow-yellow-500/10 uppercase tracking-widest"
          >
            INICIAR AGORA
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
