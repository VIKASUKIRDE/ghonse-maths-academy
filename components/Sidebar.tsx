import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ROLE_NAV_LINKS } from '../constants';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const navLinks = user ? ROLE_NAV_LINKS[user.role] : [];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-25 z-20 lg:hidden no-print ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`absolute inset-y-0 left-0 w-64 px-2 bg-white dark:bg-slate-800 space-y-6 py-7 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 border-r-2 border-slate-200 dark:border-slate-700 no-print`}>
        <div className="px-4">
            <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{APP_NAME}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rasane Nagar Road,Savedi</p>
        </div>

        <nav>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center py-2.5 px-4 rounded-lg transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 ${isActive ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-semibold' : ''}`
              }
            >
              <div className="w-6 h-6 mr-3">{link.icon}</div>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;