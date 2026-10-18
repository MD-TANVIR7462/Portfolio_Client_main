import React, { useState } from 'react';
import { FiShare2, FiTwitter, FiLinkedin, FiLink, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ShareButtons = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || 'Check this out!');

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1.5">
        <FiShare2 className="w-3.5 h-3.5" />
        Share:
      </span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-all hover:scale-105"
      >
        <FiTwitter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Twitter</span>
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-all hover:scale-105"
      >
        <FiLinkedin className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy Link"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
      >
        {copied ? (
          <>
            <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-bold">Copied!</span>
          </>
        ) : (
          <>
            <FiLink className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};
