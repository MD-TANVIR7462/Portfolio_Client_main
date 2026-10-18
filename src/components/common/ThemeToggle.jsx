import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden group border focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-95 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 shadow-sm shadow-cyan-500/10'
          : 'bg-white border-slate-200 text-amber-500 hover:border-amber-400/60 hover:bg-amber-50/50 shadow-sm'
      } ${className}`}
    >
      {/* Subtle background ambient radial glow */}
      <span
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-transparent opacity-100 group-hover:opacity-100'
            : 'bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent opacity-100 group-hover:opacity-100'
        }`}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark-icon"
            initial={{ y: -16, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 16, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 flex items-center justify-center"
          >
            <FiMoon className="w-4 h-4 fill-cyan-400/20 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </motion.div>
        ) : (
          <motion.div
            key="light-icon"
            initial={{ y: -16, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 16, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 flex items-center justify-center"
          >
            <FiSun className="w-4 h-4 fill-amber-500/20 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
