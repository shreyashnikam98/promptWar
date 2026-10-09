import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 animate-pulse">
    <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2 mb-4"></div>
    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/40">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
    ))}
  </div>
);
