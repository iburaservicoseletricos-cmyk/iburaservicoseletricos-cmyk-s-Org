
import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "scale-100", showSubtitle = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="flex items-center gap-0 logo-shadow">
        {/* Stylized U */}
        <span className="text-slate-200 font-brand text-5xl md:text-6xl tracking-tighter leading-none">U</span>
        {/* Stylized P */}
        <span className="text-yellow-500 font-brand text-5xl md:text-6xl tracking-tighter leading-none -ml-1">P</span>
      </div>
      {showSubtitle && (
        <div className="text-center mt-1">
          <div className="text-yellow-500 font-display text-2xl md:text-3xl font-bold tracking-[0.2em] leading-tight">
            CURSOS
          </div>
          <div className="text-slate-400 font-display text-[0.6rem] md:text-xs tracking-[0.4em] uppercase opacity-80">
            Nordeste EAD
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
