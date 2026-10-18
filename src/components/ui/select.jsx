import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const SelectContext = createContext(null);

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className = "" }) => {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
};

export const SelectValue = () => {
  const { value } = useContext(SelectContext);
  return <span>{value}</span>;
};

export const SelectContent = ({ children, className = "" }) => {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  return (
    <div
      className={`absolute bottom-full left-0 mb-1 w-24 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg z-[1000] ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children, className = "" }) => {
  const { onValueChange, setOpen } = useContext(SelectContext);

  return (
    <div
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      className={`px-2.5 py-1.5 text-xs rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${className}`}
    >
      {children}
    </div>
  );
};
