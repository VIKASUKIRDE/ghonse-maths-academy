import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ICONS } from '../constants';
import { BatchName, UserRole } from '../types';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout, switchBatch, availableBatches: allAvailableBatches } = useAuth();
  
  const canSwitchBatches = user?.role === UserRole.Admin || user?.role === UserRole.Teacher;

  const availableBatchesForSwitch = useMemo(() => {
      if (!user) return [];
      if (user.role === UserRole.Admin) {
          return allAvailableBatches.map(batch => batch.name);
      }
      if (user.role === UserRole.Teacher && user.assignedBatches) {
          return user.assignedBatches;
      }
      return [];
  }, [user, allAvailableBatches]);

  const handleBatchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newBatch = event.target.value as BatchName;
      if (newBatch !== user?.currentBatch) {
          switchBatch(newBatch);
      }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 no-print">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative mx-4 lg:mx-0">
          <span className="hidden sm:inline-block text-lg font-bold text-slate-700 dark:text-slate-200">{APP_NAME}</span>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex flex-col items-end mr-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                <span>{user?.role}</span>
                {user?.currentBatch && (
                    canSwitchBatches && availableBatchesForSwitch.length > 1 ? (
                        <div className="relative flex items-center">
                            <span className="mx-1">-</span>
                            <select 
                                value={user.currentBatch} 
                                onChange={handleBatchChange}
                                className="font-semibold bg-transparent border-0 rounded-md p-0 pl-1 pr-6 focus:ring-0 focus:outline-none cursor-pointer appearance-none text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                aria-label="Change batch"
                            >
                                {availableBatchesForSwitch.map(batch => (
                                    <option key={batch} value={batch} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                        {batch}
                                    </option>
                                ))}
                            </select>
                            <svg className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    ) : (
                        <span className="font-semibold"> - {user.currentBatch}</span>
                    )
                )}
            </div>
        </div>
        
        <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200">
          {ICONS.logout}
          <span className="ml-2 hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;