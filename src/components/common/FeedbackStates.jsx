import React from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { Button } from './Button';

export const ErrorState = ({
  message = 'Failed to load content. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl shadow-sm ${className}`}
    >
      <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-3">
        <FiAlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-md mb-4">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={FiRefreshCw}>
          Retry Request
        </Button>
      )}
    </div>
  );
};

export const EmptyState = ({
  title = 'No items found',
  description = 'There are currently no records to display here.',
  actionText,
  onAction,
  icon: Icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}
    >
      {Icon && (
        <div className="p-4 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl shadow-sm mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
