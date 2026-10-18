import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-6">
          <FiAlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold mb-3">Page Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          The requested URL does not exist or has been relocated to another address.
        </p>
        <Link to="/">
          <Button variant="primary" icon={FiArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
