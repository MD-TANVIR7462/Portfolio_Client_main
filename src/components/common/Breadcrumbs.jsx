import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
          >
            <FiHome className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li>
                <FiChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
              </li>
              <li>
                {isLast || !item.to ? (
                  <span
                    className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs inline-block"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium truncate max-w-[150px] inline-block"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
