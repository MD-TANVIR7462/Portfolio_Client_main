import React, { createContext, useContext, useState } from "react";

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children }) => {
  return <TooltipContext.Provider value={{}}>{children}</TooltipContext.Provider>;
};

export const Tooltip = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type?.displayName === "TooltipTrigger") {
          return child;
        }
        if (child.type?.displayName === "TooltipContent") {
          return open ? child : null;
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = ({ children, asChild, className = "", ...props }) => {
  return (
    <div className={`inline-flex ${className}`} {...props}>
      {children}
    </div>
  );
};
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-md shadow-md whitespace-nowrap pointer-events-none z-50 animate-in fade-in duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
TooltipContent.displayName = "TooltipContent";
