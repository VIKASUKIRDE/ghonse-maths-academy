import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, ICONS } from '../../constants';
import { AcademicYear, UserRole } from '../../types';

const AcademicYearSelectionPage: React.FC = () => {
    const { tempUser, selectAcademicYear, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!tempUser || tempUser.role !== UserRole.Admin || !tempUser.availableAcademicYears)) {
            navigate('/login', { replace: true });
        }
    }, [tempUser, loading, navigate]);

    if (loading || !tempUser || !tempUser.availableAcademicYears) {
        return <div className="flex items-center justify-center h-screen"><div>Loading...</div></div>;
    }
    
    const handleSelectYear = (year: AcademicYear) => {
        selectAcademicYear(year);
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
                        Please select an Academic Year to manage.
                    </p>
                </div>
                
                <div className="max-w-4xl w-full mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {tempUser.availableAcademicYears.map(year => (
                         <button 
                            key={year} 
                            onClick={() => handleSelectYear(year)}
                            className="block bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 ease-in-out h-full text-left flex flex-col items-center justify-center"
                        >
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 dark:bg-slate-700 text-teal-600 dark:text-teal-300 mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">{year}</h3>
                            <p className="mt-1 text-base text-center text-gray-500 dark:text-gray-400">Academic Year</p>
                        </button>
                    ))}
                </div>

                 <div className="mt-12 text-center">
                    <button onClick={logout} className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                        &larr; Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcademicYearSelectionPage;
