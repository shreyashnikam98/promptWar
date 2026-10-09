import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, Map, ShieldAlert, History, Utensils, BarChart3, CloudSun,
  Sun, Moon, Bell, User, LogOut, Menu, X, PlusCircle, Scale,
  ChevronDown, Search, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dashboardService } from '../../services/dashboardService';
import { ReportIssueModal } from '../forms/ReportIssueModal';

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru'];

export const Navbar = () => {
  const { user, isAuthenticated, isModerator, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark, activeCity, changeCity } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dashboardService.getNotifications().then((res) => {
        if (res.success) {
          setUnreadNotifications(res.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'City Map', path: '/map', icon: Map },
    { name: 'Safety Intelligence', path: '/safety', icon: ShieldAlert },
    { name: 'History & Culture', path: '/history', icon: History },
    { name: 'Food & Stays', path: '/hospitality', icon: Utensils },
    { name: 'Compare', path: '/compare', icon: Scale },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Weather', path: '/weather', icon: CloudSun },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 p-0.5 flex items-center justify-center shadow-glow-blue transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-cyan-400 transition-transform duration-500 group-hover:rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  City Life
                </span>
                <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 -mt-1 tracking-wider uppercase">
                  Smart Urban Navigator
                </span>
              </div>
            </Link>

            {/* City Selector */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <select
                  value={activeCity}
                  onChange={(e) => changeCity(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search places, street food, fort..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </form>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Report Issue Button */}
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 border border-rose-200 dark:border-rose-900/60 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
                Report Hazard
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  className="p-2 relative rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-900"></span>
                  )}
                </Link>
              )}

              {/* User Menu or Auth */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-xl py-2 z-50 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          Role: {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-3.5 h-3.5" />
                        My Profile & Settings
                      </Link>

                      <Link
                        to="/my-reports"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        My Incident Reports
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Saved Places
                      </Link>

                      {isModerator && (
                        <Link
                          to="/moderator"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Moderator Queue
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 font-semibold"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-sm transition"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 bg-white dark:bg-slate-900">
            {/* Mobile city selector */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Active City:</span>
              <select
                value={activeCity}
                onChange={(e) => changeCity(e.target.value)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Icon className="w-4 h-4 text-cyan-500" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setReportModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              Report Hazard
            </button>
          </div>
        )}
      </header>

      {/* Citizen Report Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </>
  );
};
