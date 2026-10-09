import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404 — Off the Map</h1>
      <p className="text-sm text-slate-500">
        The urban street, monument, or sector you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home Exploration
      </Link>
    </div>
  );
};
