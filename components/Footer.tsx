
import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/30 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <Logo className="scale-50 -ml-4" showSubtitle={true} />
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            Formando os heróis do amanhã. A melhor preparação para carreiras militares e segurança pública do Nordeste.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
          <div className="space-y-1">
            <h4 className="text-yellow-500 font-display font-bold text-xs uppercase tracking-widest">Endereço</h4>
            <p className="text-slate-300 text-sm">Rua José Anacleto - MARANGUAPE 02, Paulista - PE, 53422-550</p>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-yellow-500 font-display font-bold text-xs uppercase tracking-widest">Contato</h4>
            <p className="text-slate-300 text-sm">(81) 97322-4504 / (81) 98644-2751</p>
            <p className="text-slate-300 text-sm font-medium">upcursosnordeste@gmail.com</p>
          </div>

          <div className="space-y-1">
            <h4 className="text-yellow-500 font-display font-bold text-xs uppercase tracking-widest">Institucional</h4>
            <p className="text-slate-400 text-xs">CNPJ: 59.185.087/0001-61</p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-800/50 text-center">
        <p className="text-slate-600 text-xs uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} UP CURSOS - NORDESTE EAD. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
