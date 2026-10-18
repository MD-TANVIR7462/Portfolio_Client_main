import React from 'react';

export const BrandLogo = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-base',
    lg: 'h-11 text-lg',
  };

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Sleek Hex / Terminal Monogram Badge */}
      <div className={`relative ${iconSizes[size] || iconSizes.md} rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-[1.5px] shadow-sm shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300`}>
        <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
          {/* Subtle Cyber Gradient Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-cyan-500/10 pointer-events-none" />
          
          {/* Clean Terminal Bracket Accent */}
          <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200 tracking-tighter">
            &lt;T/&gt;
          </span>
        </div>
      </div>

      {/* Modern Developer Wordmark */}
      <div className="flex items-baseline gap-1">
        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          Tanvir
        </span>
        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
          .dev
        </span>
      </div>
    </div>
  );
};

export default BrandLogo;
