import React, { forwardRef } from 'react';

/**
 * Modern iOS / Cyber themed Toggle Switch component
 */
export const Switch = forwardRef(
  ({ checked, onChange, label, description, disabled = false, className = '', ...props }, ref) => {
    return (
      <label
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div
            className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500/30 dark:peer-focus:ring-teal-500/20 rounded-full peer dark:bg-slate-700/80 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm dark:border-slate-600 peer-checked:bg-teal-500 dark:peer-checked:bg-teal-600 transition-colors"
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
export default Switch;
