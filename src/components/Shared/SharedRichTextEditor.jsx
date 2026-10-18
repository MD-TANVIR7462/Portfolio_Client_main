import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Save,
  Trash2,
  Eye,
  Code2,
  CheckCircle2,
  Copy,
  PenTool,
  Loader2,
  Sparkles,
  AlertCircle,
  Info,
  X,
  Maximize2,
  Minimize2,
  Printer,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Table,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const VIEW_MODES = Object.freeze({
  EDITOR: 'editor',
  PREVIEW: 'preview',
  HTML: 'html',
});

const TOAST_DURATION_MS = 3200;
const READING_WORDS_PER_MIN = 200;
const DEFAULT_TITLE = 'Untitled Document';

const STATUS = Object.freeze({
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
});

/* ============================================================================
 * HOOKS
 * ========================================================================== */

function useDocumentStats(html) {
  return useMemo(() => {
    const plain = String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = plain ? plain.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const charCount = plain.length;
    const readingTime = Math.max(wordCount === 0 ? 0 : 1, Math.ceil(wordCount / READING_WORDS_PER_MIN));

    return {
      wordCount,
      charCount,
      readingTime,
      readingTimeLabel: `${readingTime} min read`,
      isEmpty: plain.length === 0,
    };
  }, [html]);
}

function useKeyboardShortcuts(map, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      const combo = isMod ? `mod+${e.key.toLowerCase()}` : e.key.toLowerCase();
      const fn = map[combo];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map, enabled]);
}

function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copy = useCallback(
    async (text) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const el = document.createElement('textarea');
          el.value = text;
          el.setAttribute('readonly', '');
          el.style.position = 'absolute';
          el.style.left = '-9999px';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch (err) {
        console.error('[RTE] Clipboard write failed:', err);
        return false;
      }
    },
    [resetMs]
  );

  return { copied, copy };
}

/* ============================================================================
 * SUB-COMPONENTS
 * ========================================================================== */

const EditorStats = memo(function EditorStats({ wordCount, charCount, readingTimeLabel }) {
  return (
    <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-zinc-400">
      <span className="font-medium text-slate-700 dark:text-zinc-300">
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </span>
      <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">
        •
      </span>
      <span>{charCount.toLocaleString()} characters</span>
      <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">
        •
      </span>
      <span>~{readingTimeLabel}</span>
    </div>
  );
});

EditorStats.propTypes = {
  wordCount: PropTypes.number.isRequired,
  charCount: PropTypes.number.isRequired,
  readingTimeLabel: PropTypes.string.isRequired,
};

const ActiveSwitch = memo(function ActiveSwitch({
  active,
  onChange,
  disabled = false,
  labels = { on: 'Published', off: 'Draft' },
}) {
  const id = 'rte-active-switch';

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <Switch
        id={id}
        checked={active}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={`Document status: ${active ? labels.on : labels.off}`}
      />
      <Label
        htmlFor={id}
        className={[
          'text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-colors',
          active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500',
        ].join(' ')}
      >
        {active ? labels.on : labels.off}
      </Label>
    </div>
  );
});

const VIEW_TABS = [
  { id: VIEW_MODES.EDITOR, label: 'Editor', icon: PenTool, shortcut: '1' },
  { id: VIEW_MODES.PREVIEW, label: 'Preview', icon: Eye, shortcut: '2' },
  { id: VIEW_MODES.HTML, label: 'Source', icon: Code2, shortcut: '3' },
];

const ViewSwitcher = memo(function ViewSwitcher({ activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Editor view modes"
      className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800/90 rounded-xl border border-slate-200/60 dark:border-zinc-700/60"
    >
      {VIEW_TABS.map(({ id, label, icon: Icon, shortcut }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`rte-panel-${id}`}
            id={`rte-tab-${id}`}
            onClick={() => onChange(id)}
            title={`${label} (Ctrl/⌘ + ${shortcut})`}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900',
              active
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
});

ViewSwitcher.propTypes = {
  activeTab: PropTypes.oneOf(Object.values(VIEW_MODES)).isRequired,
  onChange: PropTypes.func.isRequired,
};

const EmptyState = memo(function EmptyState({ message }) {
  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 gap-2.5">
      <Sparkles className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
});

EmptyState.propTypes = { message: PropTypes.string.isRequired };

const TOAST_ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const TOAST_COLORS = {
  success: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
  error: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200',
  info: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200',
};

function Toast({ open, message, variant = 'info', onClose, duration = TOAST_DURATION_MS }) {
  useEffect(() => {
    if (!open || duration <= 0) return undefined;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const Icon = TOAST_ICONS[variant] || Info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed top-4 right-4 z-[10000] flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg',
        'backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200',
        TOAST_COLORS[variant] || TOAST_COLORS.info,
      ].join(' ')}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium pr-2">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

Toast.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string,
  variant: PropTypes.oneOf(['success', 'error', 'info']),
  onClose: PropTypes.func,
  duration: PropTypes.number,
};

function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => e.key === 'Escape' && onCancel?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rte-confirm-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 id="rte-confirm-title" className="text-sm font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/* ============================================================================
 * STYLES
 * ========================================================================== */

const EditorStyles = memo(function EditorStyles({ minHeight }) {
  return (
    <style>{`
      .rte-prose-editor {
        min-height: ${minHeight};
        outline: none;
      }
      .rte-prose-editor:empty:before {
        content: attr(data-placeholder);
        color: #94a3b8;
        pointer-events: none;
        display: block;
      }
      .dark .rte-prose-editor:empty:before {
        color: #64748b;
      }
      .ck-content h1, .rte-prose-editor h1 {
        font-size: 1.85rem;
        font-weight: 800;
        margin-top: 1.25rem;
        margin-bottom: 0.75rem;
        color: inherit;
        letter-spacing: -0.025em;
      }
      .ck-content h2, .rte-prose-editor h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-top: 1.15rem;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.35rem;
        color: inherit;
      }
      .dark .ck-content h2, .dark .rte-prose-editor h2 {
        border-bottom-color: #27272a;
      }
      .ck-content h3, .rte-prose-editor h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.45rem;
        color: inherit;
      }
      .ck-content p, .rte-prose-editor p {
        margin: 0.5rem 0;
        line-height: 1.75;
      }
      .ck-content blockquote, .rte-prose-editor blockquote {
        border-left: 4px solid #0d9488;
        background: #f0fdfa;
        padding: 0.75rem 1.25rem;
        margin: 1rem 0;
        font-style: italic;
        border-radius: 0 8px 8px 0;
        color: #0f766e;
      }
      .dark .ck-content blockquote, .dark .rte-prose-editor blockquote {
        background: #042f2e;
        border-left-color: #14b8a6;
        color: #99f6e4;
      }
      .ck-content pre, .rte-prose-editor pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: monospace;
        font-size: 13px;
      }
      .ck-content table, .rte-prose-editor table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      .ck-content th, .ck-content td, .rte-prose-editor th, .rte-prose-editor td {
        border: 1px solid #cbd5e1;
        padding: 8px 12px;
        text-align: left;
      }
      .dark .ck-content th, .dark .ck-content td, .dark .rte-prose-editor th, .dark .rte-prose-editor td {
        border-color: #3f3f46;
      }
      .ck-content th, .rte-prose-editor th {
        background: #f8fafc;
        font-weight: 600;
      }
      .dark .ck-content th, .dark .rte-prose-editor th {
        background: #18181b;
      }
      .ck-content ul, .rte-prose-editor ul {
        list-style-type: disc;
        padding-left: 1.5rem;
        margin: 0.75rem 0;
      }
      .ck-content ol, .rte-prose-editor ol {
        list-style-type: decimal;
        padding-left: 1.5rem;
        margin: 0.75rem 0;
      }
      .ck-content a, .rte-prose-editor a {
        color: #0d9488;
        text-decoration: underline;
      }
      @media print {
        body * {
          visibility: hidden !important;
        }
        .unified-editor, .unified-editor * {
          visibility: visible !important;
        }
        .unified-editor {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          border: none !important;
          box-shadow: none !important;
        }
        .unified-editor .border-b,
        .unified-editor button,
        .unified-editor .shrink-0 {
          display: none !important;
        }
      }
    `}</style>
  );
});

EditorStyles.propTypes = { minHeight: PropTypes.string.isRequired };

/* ============================================================================
 * MAIN COMPONENT — SharedRichTextEditor
 * ========================================================================== */

export const SharedRichTextEditor = ({
  initialTitle = '',
  initialValue = '',
  initialActive = true,
  defaultTab = VIEW_MODES.EDITOR,
  initialViewMode,
  placeholder = 'Start drafting your content here...',
  titlePlaceholder = 'Document Title...',
  submitButtonText = 'Publish Blog',
  minHeight = '480px',
  className = '',
  maxWords = 0,
  disabled = false,
  status = STATUS.IDLE,
  onSubmit,
  onChange,
  onActiveChange,
}) => {
  const resolvedDefaultTab = initialViewMode || defaultTab || VIEW_MODES.EDITOR;
  const [docTitle, setDocTitle] = useState(initialTitle);
  const [editorData, setEditorData] = useState(initialValue);
  const [isActive, setIsActive] = useState(initialActive);
  const [activeTab, setActiveTab] = useState(resolvedDefaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', variant: 'info' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const editableRef = useRef(null);
  const initialSnapshotRef = useRef({ title: initialTitle, data: initialValue, active: initialActive });

  const stats = useDocumentStats(editorData);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    setDocTitle(initialTitle);
    setEditorData(initialValue);
    setIsActive(initialActive);
    setActiveTab(resolvedDefaultTab);
    initialSnapshotRef.current = { title: initialTitle, data: initialValue, active: initialActive };
    if (editableRef.current && editableRef.current.innerHTML !== initialValue) {
      editableRef.current.innerHTML = initialValue;
    }
  }, [initialTitle, initialValue, initialActive, resolvedDefaultTab]);

  const isDirty =
    docTitle !== initialSnapshotRef.current.title ||
    editorData !== initialSnapshotRef.current.data ||
    isActive !== initialSnapshotRef.current.active;

  const isSubmitting = status === STATUS.SAVING;
  const isSavedSuccess = status === STATUS.SAVED;

  const showToast = useCallback((message, variant = 'info') => setToast({ open: true, message, variant }), []);
  const closeToast = useCallback(() => setToast((t) => ({ ...t, open: false })), []);

  const handleActiveToggle = useCallback(
    (nextActive) => {
      setIsActive(nextActive);
      onActiveChange?.(nextActive);
    },
    [onActiveChange]
  );

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editableRef.current) {
      setEditorData(editableRef.current.innerHTML);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="border border-slate-300 dark:border-zinc-700 w-full my-4">
        <thead>
          <tr><th class="border p-2 bg-slate-100 dark:bg-zinc-800">Header 1</th><th class="border p-2 bg-slate-100 dark:bg-zinc-800">Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td class="border p-2">Cell 1</td><td class="border p-2">Cell 2</td></tr>
        </tbody>
      </table>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    if (editableRef.current) {
      setEditorData(editableRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (disabled || isSubmitting) return;

      if (maxWords > 0 && stats.wordCount > maxWords) {
        showToast(
          `Document exceeds the ${maxWords.toLocaleString()}-word limit (currently ${stats.wordCount.toLocaleString()}).`,
          'error'
        );
        return;
      }

      const payload = {
        title: docTitle.trim() || DEFAULT_TITLE,
        contentHtml: editorData,
        content: editorData,
        isActive,
        published: isActive,
        wordCount: stats.wordCount,
        charCount: stats.charCount,
        readingTimeMinutes: stats.readingTime,
        readTime: stats.readingTimeLabel,
        updatedAt: new Date().toISOString(),
      };

      try {
        await onSubmit?.(payload);
        if (status !== STATUS.ERROR) {
          initialSnapshotRef.current = { title: docTitle, data: editorData, active: isActive };
        }
      } catch (err) {
        console.error('[RTE] onSubmit handler threw:', err);
        showToast(err?.message || 'Failed to save document.', 'error');
      }
    },
    [disabled, isSubmitting, maxWords, stats, docTitle, editorData, isActive, onSubmit, showToast, status]
  );

  const requestClear = useCallback(() => {
    if (!editorData && !docTitle) return;
    setConfirmOpen(true);
  }, [editorData, docTitle]);

  const confirmClear = useCallback(() => {
    setEditorData('');
    setDocTitle('');
    if (editableRef.current) {
      editableRef.current.innerHTML = '';
    }
    setConfirmOpen(false);
    showToast('Content cleared.', 'info');
  }, [showToast]);

  const handleViewChange = useCallback((view) => {
    setActiveTab(view);
  }, []);

  const shortcuts = useMemo(
    () => ({
      'mod+s': () => handleSubmit(),
      'mod+1': () => handleViewChange(VIEW_MODES.EDITOR),
      'mod+2': () => handleViewChange(VIEW_MODES.PREVIEW),
      'mod+3': () => handleViewChange(VIEW_MODES.HTML),
    }),
    [handleSubmit, handleViewChange]
  );
  useKeyboardShortcuts(shortcuts, !disabled);

  useEffect(() => {
    onChange?.({ title: docTitle, contentHtml: editorData, content: editorData, isActive, ...stats });
  }, [docTitle, editorData, isActive]);

  const handlePrintDocument = useCallback(() => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = 'none';

    document.body.appendChild(printFrame);

    const doc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(printFrame);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>
            @page {
              size: auto;
              margin: 0mm; /* Disables browser-generated default header (date, title) & footer (URL, page number) */
            }
            html {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              line-height: 1.6;
              padding: 12mm 14mm; /* Clean, minimal document padding without wasting space */
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1.doc-title {
              font-size: 1.75rem;
              font-weight: 800;
              margin: 0 0 1rem 0;
              padding-bottom: 0.5rem;
              border-bottom: 1.5px solid #e2e8f0;
              color: #0f172a;
              line-height: 1.25;
            }
            h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.4rem; }
            h2 { font-size: 1.25rem; font-weight: 700; margin: 0.9rem 0 0.35rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2rem; }
            h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.3rem; }
            p { margin: 0.4rem 0; }
            blockquote {
              border-left: 3.5px solid #0d9488;
              background: #f0fdfa;
              padding: 0.5rem 1rem;
              margin: 0.75rem 0;
              font-style: italic;
              color: #0f766e;
              border-radius: 0 6px 6px 0;
            }
            pre {
              background: #0f172a;
              color: #e2e8f0;
              padding: 0.75rem 1rem;
              border-radius: 6px;
              overflow-x: auto;
              font-family: monospace;
              font-size: 11px;
              margin: 0.75rem 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0.75rem 0;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              text-align: left;
            }
            th {
              background: #f8fafc;
              font-weight: 600;
            }
            ul { list-style-type: disc; padding-left: 1.35rem; margin: 0.5rem 0; }
            ol { list-style-type: decimal; padding-left: 1.35rem; margin: 0.5rem 0; }
            li { margin: 0.2rem 0; }
            a { color: #0d9488; text-decoration: underline; }
            img { max-width: 100%; height: auto; margin: 0.5rem 0; }
          </style>
        </head>
        <body>
          <div class="content-body">
            ${editorData || '<p>No content to print.</p>'}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.error('[RTE] Error triggering print dialog:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1000);
      }
    }, 250);
  }, [docTitle, editorData]);

  const buttonLabel = isSubmitting ? 'Saving...' : isSavedSuccess ? 'Saved!' : submitButtonText;

  return (
    <div className={`text-slate-900 dark:text-zinc-100 ${className}`}>
      <EditorStyles minHeight={minHeight} />

      <div
        className={[
          'unified-editor bg-white dark:bg-zinc-900 shadow-sm transition-all',
          isFullscreen
            ? 'fixed inset-0 z-[9999] w-screen h-screen overflow-hidden flex flex-col rounded-none border-0 bg-white dark:bg-zinc-950'
            : 'w-full rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden',
        ].join(' ')}
      >
        {/* Header Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shrink-0 z-10">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full text-base font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-0 px-0"
            />
            <div className="flex items-center gap-2">
              <EditorStats
                wordCount={stats.wordCount}
                charCount={stats.charCount}
                readingTimeLabel={stats.readingTimeLabel}
              />
              {isDirty && !isSubmitting && (
                <span
                  className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                  title="Unsaved changes"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
            <ActiveSwitch active={isActive} onChange={handleActiveToggle} disabled={disabled} />
            <ViewSwitcher activeTab={activeTab} onChange={handleViewChange} />

            <button
              type="button"
              onClick={handlePrintDocument}
              title="Print Document"
              className="inline-flex items-center gap-1.5 p-1.5 px-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-700/60"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="inline-flex items-center gap-1 p-1.5 px-2 text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-700/60"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={requestClear}
              disabled={disabled || (!editorData && !docTitle)}
              title="Clear Document"
              className="p-2 text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || disabled}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isSavedSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {buttonLabel}
            </Button>
          </div>
        </div>

        {/* Toolbar (Only visible in Editor view) */}
        {activeTab === VIEW_MODES.EDITOR && (
          <div className="px-6 py-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFormat('undo')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('redo')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<h1>')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<h2>')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<h3>')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<p>')}
              className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-xs font-semibold text-slate-700 dark:text-zinc-300"
              title="Paragraph"
            >
              P
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => handleFormat('bold')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300 font-bold"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('italic')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300 italic"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('underline')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300 underline"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('strikeThrough')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300 line-through"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<pre>')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => handleFormat('insertUnorderedList')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('insertOrderedList')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('formatBlock', '<blockquote>')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('insertHorizontalRule')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Horizontal Line"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Insert Link"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Insert Table"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => handleFormat('justifyLeft')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('justifyCenter')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('justifyRight')}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-700 dark:text-zinc-300"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Work Area */}
        <div className={isFullscreen ? 'flex-1 overflow-y-auto' : ''}>
          {activeTab === VIEW_MODES.EDITOR && (
            <div className="bg-slate-50/50 dark:bg-zinc-950/50 p-4 sm:p-6">
              <div
                ref={editableRef}
                contentEditable={!disabled}
                onInput={(e) => setEditorData(e.currentTarget.innerHTML)}
                data-placeholder={placeholder}
                className="rte-prose-editor w-full max-w-4xl mx-auto bg-white dark:bg-[#0f0f11] text-slate-900 dark:text-zinc-100 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: initialValue }}
              />
            </div>
          )}

          {activeTab === VIEW_MODES.PREVIEW && (
            <div className="bg-slate-100 dark:bg-zinc-950 p-6 min-h-[480px]">
              {editorData.trim() ? (
                <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0f0f11] text-slate-900 dark:text-zinc-100 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-8">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                    {docTitle || 'Untitled Blog Post'}
                  </h1>
                  <div
                    className="ck-content select-text leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: editorData }}
                  />
                </div>
              ) : (
                <EmptyState message="Document is empty. Switch to the Editor tab to start drafting." />
              )}
            </div>
          )}

          {activeTab === VIEW_MODES.HTML && (
            <div className="bg-slate-950 dark:bg-black text-slate-100 p-6 font-mono text-xs overflow-x-auto min-h-[480px]">
              <div className="flex justify-between items-center mb-4 text-slate-400 border-b border-slate-800 pb-3">
                <span className="font-semibold text-slate-300 tracking-wide">HTML SOURCE OUTPUT</span>
                <button
                  type="button"
                  onClick={() => copy(editorData || '')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed break-words">
                {editorData || '<!-- Document is empty -->'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-200/80 dark:border-zinc-800 text-xs text-slate-400 dark:text-zinc-500 flex items-center justify-between">
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-sans text-[10px]">Ctrl/⌘ S</kbd> to save
          </span>
          <span className="sm:hidden">RichText Studio</span>
          <span>
            Status:{' '}
            <span className={isDirty ? 'text-amber-500 font-medium' : ''}>
              {isSubmitting ? 'Saving…' : isDirty ? 'Drafting' : stats.isEmpty ? 'Empty' : 'Saved'}
            </span>
          </span>
        </div>
      </div>

      <Toast open={toast.open} message={toast.message} variant={toast.variant} onClose={closeToast} />

      <ConfirmDialog
        open={confirmOpen}
        title="Clear this document?"
        message="This will remove the title and all content. This action cannot be undone."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={confirmClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

SharedRichTextEditor.propTypes = {
  initialTitle: PropTypes.string,
  initialValue: PropTypes.string,
  initialActive: PropTypes.bool,
  defaultTab: PropTypes.oneOf(Object.values(VIEW_MODES)),
  initialViewMode: PropTypes.oneOf(Object.values(VIEW_MODES)),
  placeholder: PropTypes.string,
  titlePlaceholder: PropTypes.string,
  submitButtonText: PropTypes.string,
  minHeight: PropTypes.string,
  className: PropTypes.string,
  maxWords: PropTypes.number,
  disabled: PropTypes.bool,
  status: PropTypes.oneOf(Object.values(STATUS)),
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onActiveChange: PropTypes.func,
};

export { VIEW_MODES, STATUS };
export default SharedRichTextEditor;
