import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
        />
      ))}
    </>
  );
};
