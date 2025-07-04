import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { ICONS } from '../../constants';

const AdminProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const restoreInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = async () => {
        setIsBackingUp(true);
        setError('');
        setSuccess('');
        try {
            const data = await api.getAllData();
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `ghonse-maths-backup-${timestamp}.json`;
            link.click();
            setSuccess('Backup downloaded successfully!');
        } catch (err) {
            setError('Failed to create backup.');
            console.error(err);
        } finally {
            setIsBackingUp(false);
        }
    };
    
    const triggerRestore = () => {
        setError('');
        setSuccess('');
        restoreInputRef.current?.click();
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm('Are you sure you want to restore data from this file? This will overwrite all current data in the application. This action cannot be undone.')) {
            // Clear the input value so the same file can be selected again
            if(restoreInputRef.current) restoreInputRef.current.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            setIsRestoring(true);
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('File could not be read.');
                }
                const data = JSON.parse(text);
                await api.restoreData(data);
                setSuccess('Data restored successfully! Please log out and log back in to see the changes everywhere.');
                // Recommended to logout to reset all states
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse or restore backup file. It may be corrupt.');
                console.error(err);
            } finally {
                setIsRestoring(false);
                // Clear the input value
                if(restoreInputRef.current) restoreInputRef.current.value = "";
            }
        };
        reader.onerror = () => {
             setError('Failed to read the file.');
        };
        reader.readAsText(file);
    };

    if (!user) {
        return <div>Loading user profile...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Profile & Settings</h1>
            
            <div className="mt-6 space-y-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-3 mb-4">Admin Information</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                           {ICONS.profile}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-md text-slate-500 dark:text-slate-400">{user.role}</p>
                        </div>
                    </div>
                </div>

                 {/* Data Management Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-3 mb-4">Data Management</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Backup all application data (students, teachers, fees, exams, etc.) to a file, or restore the application state from a backup file.</p>
                    
                    {error && <div className="my-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}
                    {success && <div className="my-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">{success}</div>}

                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleBackup}
                            disabled={isBackingUp || isRestoring}
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {ICONS.backup}
                            <span className="ml-2">{isBackingUp ? 'Backing up...' : 'Backup Data'}</span>
                        </button>
                        
                        <button
                            onClick={triggerRestore}
                            disabled={isRestoring || isBackingUp}
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                            {ICONS.restore}
                           <span className="ml-2">{isRestoring ? 'Restoring...' : 'Restore Data'}</span>
                        </button>
                        <input
                          type="file"
                          ref={restoreInputRef}
                          onChange={handleRestore}
                          accept=".json"
                          className="hidden"
                        />
                    </div>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-3 text-center">
                        <strong>Warning:</strong> Restoring data will overwrite all current information in the application.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
