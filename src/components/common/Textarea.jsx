import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  ({ label, error, helperText, rows = 4, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none resize-y
            bg-white dark:bg-slate-900 
            text-slate-900 dark:text-slate-100
            ${
              error
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
            }
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
