import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ICONS } from '../constants';
import { Batch, BatchName, UserRole } from '../types';

const BatchSelectionPage: React.FC = () => {
    const { tempUser, selectBatch, logout, loading, availableBatches: allAvailableBatches } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If for some reason someone lands here without being in the tempUser state, send them to login.
        if (!loading && !tempUser) {
            navigate('/login', { replace: true });
        }
    }, [tempUser, loading, navigate]);

    const batchesForSelection = useMemo(() => {
        if (!tempUser) return [];
        if (tempUser.role === UserRole.Admin) {
            return allAvailableBatches.map(b => b.name);
        }
        return tempUser.assignedBatches || [];
    }, [tempUser, allAvailableBatches]);

    if (loading || !tempUser) {
        return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>;
    }
    
    const handleSelectBatch = (batchName: BatchName) => {
        selectBatch(batchName);
        // The App.tsx router will handle navigating to the dashboard
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop')" }}
        >
            <div className="min-h-screen bg-black/70 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-white">Welcome, {tempUser.name}</h2>
                    <p className="mt-2 text-lg text-gray-200">
                        Please select a batch to continue to the {APP_NAME} portal.
                    </p>
                </div>
                
                <div className="max-w-4xl w-full mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {batchesForSelection.map(batchName => (
                         <button 
                            key={batchName} 
                            onClick={() => handleSelectBatch(batchName)}
                            className="block bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 ease-in-out h-full text-left flex flex-col items-center justify-center"
                        >
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 mx-auto mb-4">
                                {ICONS.batches}
                            </div>
                            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">{batchName}</h3>
                            <p className="mt-1 text-base text-center text-gray-500 dark:text-gray-400">Batch</p>
                        </button>
                    ))}
                </div>

                 <div className="mt-12 text-center">
                    <button onClick={logout} className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                        &larr; Logout and Change Role
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchSelectionPage;