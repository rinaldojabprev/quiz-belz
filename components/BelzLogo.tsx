import React from 'react';

interface BelzLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BelzLogo: React.FC<BelzLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Emblem for Belz */}
      <div className={`relative ${iconSizes[size]} shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center border border-white/20">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5 text-white"
          >
            {/* Geometric stylized B / Shield representing Seguros & Protection */}
            <path
              d="M11 9C11 7.89543 11.8954 7 13 7H22C25.3137 7 28 9.68629 28 13C28 15.5 26.5 17.5 24 18.3C27 19.2 29 21.8 29 25C29 28.866 25.866 32 22 32H13C11.8954 32 11 31.1046 11 30V9Z"
              fill="currentColor"
              fillOpacity="0.25"
            />
            <path
              d="M13 10H21C23.2091 10 25 11.7909 25 14C25 16.2091 23.2091 18 21 18H13V10Z"
              fill="white"
            />
            <path
              d="M13 18H22C24.4853 18 26.5 20.0147 26.5 22.5C26.5 24.9853 24.4853 27 22 27H13V18Z"
              fill="white"
            />
            {/* Dynamic Energy Lightning / Speed Angle */}
            <path
              d="M29 6L33 13H27L30 20"
              stroke="#FACC15"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-white ${titleSizes[size]}`}>
            BELZ
          </span>
          <span
            className={`font-black tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent ${titleSizes[size]}`}
          >
            QUIZ
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-medium tracking-widest text-slate-400 uppercase mt-0.5 ${subSizes[size]}`}
          >
            Grupo Belz • Corretora de Seguros
          </span>
        )}
      </div>
    </div>
  );
};
