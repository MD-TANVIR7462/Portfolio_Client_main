import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const DropdownContext = createContext(null);

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild }) => {
  const { open, setOpen } = useContext(DropdownContext);
  return (
    <div onClick={() => setOpen(!open)} className="inline-flex cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({ children, align = "end", className = "" }) => {
  const { open } = useContext(DropdownContext);
  if (!open) return null;

  const alignmentClass = align === "end" ? "right-0" : "left-0";

  return (
    <div
      className={`absolute ${alignmentClass} mt-1 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg ring-1 ring-black ring-opacity-5 z-[1000] focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = "" }) => {
  const { setOpen } = useContext(DropdownContext);
  return (
    <div
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${className}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange, className = "" }) => {
  return (
    <div
      onClick={() => onCheckedChange?.(!checked)}
      className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none ${className}`}
    >
      <span>{children}</span>
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
      />
    </div>
  );
};

export const DropdownMenuLabel = ({ children, className = "" }) => {
  return (
    <div className={`px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => {
  return <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />;
};
