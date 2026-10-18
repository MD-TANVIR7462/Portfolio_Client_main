import React, { forwardRef } from 'react';

export const Label = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});
Label.displayName = 'Label';
export default Label;
