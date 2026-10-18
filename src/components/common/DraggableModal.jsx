import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const DraggableModal = ({
  isOpen,
  onClose,
  children,
  title,
  width = "max-w-3xl",
  maxWidth, // fallback alias if maxWidth is passed
  color = "bg-white dark:bg-slate-900",
  bgcolor = "bg-black/50 dark:bg-black/70",
  isDanger = false,
}) => {
  const modalWidth = maxWidth || width;
  const [shake, setShake] = useState(false);
  const modalRef = useRef(null);
  const boundsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    setShake(true);

    setTimeout(() => {
      setShake(false);
    }, 500);
  };

  const portalTarget = typeof document !== 'undefined'
    ? (document.getElementById("portal") || document.body)
    : null;

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={boundsRef}
          className={cn(
            "fixed inset-0 z-[999] flex items-start justify-center overflow-hidden backdrop-blur-[1px]",
            bgcolor,
            "pt-[6vh] sm:pt-[8vh]"
          )}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative rounded-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl m-2 sm:m-3 md:m-4 border border-slate-200 dark:border-slate-800",
              modalWidth,
              color
            )}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: shake ? [1, 1.05, 1] : 1,
            }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{
              scale: {
                duration: 0.2,
                ease: "easeOut",
              },
              opacity: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
              y: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
            }}
          >
            <div
              className={cn(
                "sticky top-0 z-50 backdrop-blur-sm p-4 border-b flex justify-between items-center gap-4 select-none",
                color,
                isDanger
                  ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/50"
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              <h2
                className={cn(
                  "md:text-lg text-sm font-bold truncate",
                  isDanger
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-900 dark:text-slate-100"
                )}
              >
                {title}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-shrink-0 transition-colors p-1.5 rounded-lg cursor-pointer",
                  isDanger
                    ? "text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-73px)] p-4 sm:p-6 text-slate-800 dark:text-slate-200">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
};

export const Modal = DraggableModal;
export default DraggableModal;
