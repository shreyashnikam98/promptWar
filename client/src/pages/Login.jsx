import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPass);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 mx-auto flex items-center justify-center shadow-glow-blue">
          <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to City Life</h1>
        <p className="text-xs text-slate-500">Access citizen reporting, save favorites, and write reviews</p>
      </div>

      {/* Demo Credentials Quick Switcher */}
      <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs space-y-2">
        <span className="font-bold text-cyan-800 dark:text-cyan-300 block">⚡ 1-Click Demo Evaluation Profiles:</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@citylife.org', 'Admin@123456')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-700 font-semibold text-slate-800 dark:text-white hover:bg-cyan-100 transition text-[11px]"
          >
            👮 Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('moderator@citylife.org', 'Mod@123456')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-700 font-semibold text-slate-800 dark:text-white hover:bg-cyan-100 transition text-[11px]"
          >
            🛡️ Moderator
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('citizen@citylife.org', 'User@123456')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-700 font-semibold text-slate-800 dark:text-white hover:bg-cyan-100 transition text-[11px]"
          >
            👤 Citizen
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-panel space-y-4 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          {loading ? 'Signing In...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </form>
    </div>
  );
};
