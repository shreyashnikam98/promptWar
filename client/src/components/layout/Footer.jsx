import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, Github, Mail, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b15] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 p-0.5 flex items-center justify-center shadow-glow-blue">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                City Life
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Exploring, experiencing, and navigating urban chaos with real verified citizen safety intelligence, cultural discovery, real-time climate telemetry, and safer route recommendations.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Municipal Intelligence & OpenStreetMap Data Standard</span>
            </div>
          </div>

          {/* Urban Discovery */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Urban Discovery
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/explore?category=Tourist attractions" className="hover:text-cyan-500 transition">Tourist Attractions</Link></li>
              <li><Link to="/history" className="hover:text-cyan-500 transition">Heritage & Forts</Link></li>
              <li><Link to="/hospitality?category=Street food" className="hover:text-cyan-500 transition">Street Food Corridors</Link></li>
              <li><Link to="/hospitality?category=Budget stays" className="hover:text-cyan-500 transition">Budget Stays & Hostels</Link></li>
              <li><Link to="/explore?category=Parks" className="hover:text-cyan-500 transition">Municipal Parks & Gardens</Link></li>
            </ul>
          </div>

          {/* Safety & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Safety & Intelligence
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/safety" className="hover:text-cyan-500 transition">Safety Heatmap & Alerts</Link></li>
              <li><Link to="/map" className="hover:text-cyan-500 transition">Interactive GIS Map</Link></li>
              <li><Link to="/compare" className="hover:text-cyan-500 transition">Compare Places Module</Link></li>
              <li><Link to="/insights" className="hover:text-cyan-500 transition">Smart City Insights</Link></li>
              <li><Link to="/weather" className="hover:text-cyan-500 transition">Weather Intelligence</Link></li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Transparency
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Citizen reports are informational and vetted by municipal moderators. No unverified report is presented as established fact.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:support@citylife.org" className="hover:text-cyan-500 transition">
                <Mail className="w-4 h-4" />
              </a>
              <Link to="/insights" className="hover:text-cyan-500 transition">
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} City Life Platform. Built for College Engineering Demonstration.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for safer, smarter cities.
          </p>
        </div>
      </div>
    </footer>
  );
};
