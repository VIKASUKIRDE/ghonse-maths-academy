import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { ICONS } from '../../constants';
import { UserRole, AcademicYear } from '../../types';

const AdminProfilePage: React.FC = () => {
    const { user, logout, changePassword, availableAcademicYears: yearsFromAuth, backupData } = useAuth();

    // State for Data Management
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [dataError, setDataError] = useState('');
    const [dataSuccess, setDataSuccess] = useState('');
    const restoreInputRef = useRef<HTMLInputElement>(null);
    
    // State for Password Change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // State for Academic Year Management
    const [newYear, setNewYear] = useState('');
    const [isAddingYear, setIsAddingYear] = useState(false);
    const [yearError, setYearError] = useState('');
    const [yearSuccess, setYearSuccess] = useState('');
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>(yearsFromAuth);

    useEffect(() => {
        setAcademicYears(yearsFromAuth);
    }, [yearsFromAuth]);

    const handleBackup = async () => {
        setIsBackingUp(true);
        setDataError(''); setDataSuccess('');
        try {
            await backupData();
            setDataSuccess('Backup downloaded successfully!');
        } catch (err) {
            setDataError(err instanceof Error ? err.message : 'Failed to create backup.');
        } finally {
            setIsBackingUp(false);
        }
    };
    
    const triggerRestore = () => {
        setDataError(''); setDataSuccess('');
        restoreInputRef.current?.click();
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!window.confirm('Are you sure you want to restore data? This will overwrite all current data.')) {
            if(restoreInputRef.current) restoreInputRef.current.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            setIsRestoring(true);
            try {
                const data = JSON.parse(e.target?.result as string);
                await api.restoreData(data);
                setDataSuccess('Data restored successfully! Please log out and log back in.');
            } catch (err) {
                setDataError(err instanceof Error ? err.message : 'Failed to restore backup.');
            } finally {
                setIsRestoring(false);
                if(restoreInputRef.current) restoreInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(''); setPasswordSuccess('');
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long."); return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match."); return;
        }
        setIsChangingPassword(true);
        try {
            if (!user) throw new Error("User not found");
            await changePassword(user.id, user.role, oldPassword, newPassword);
            setPasswordSuccess("Password changed successfully!");
            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.message || "Failed to change password.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleAddYear = async (e: React.FormEvent) => {
        e.preventDefault();
        setYearError(''); setYearSuccess('');
        if (!/^\d{4}-\d{4}$/.test(newYear)) {
            setYearError('Year must be in YYYY-YYYY format (e.g., 2025-2026).');
            return;
        }
        setIsAddingYear(true);
        try {
            await api.addAcademicYear(newYear);
            setYearSuccess(`Academic year ${newYear} added successfully. Batches have been copied from the previous year.`);
            const updatedYears = await api.getAcademicYears();
            setAcademicYears(updatedYears);
            setNewYear('');
        } catch (err: any) {
            setYearError(err.message);
        } finally {
            setIsAddingYear(false);
        }
    };

    if (!user) return <div>Loading user profile...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Profile & Settings</h1>
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold border-b pb-3 mb-4">My Information</h2>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">{ICONS.profile}</div>
                            <div>
                                <p className="text-lg font-bold">{user.name}</p>
                                <p className="text-md text-slate-500">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    {user.role === UserRole.Admin && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Academic Year Management</h2>
                            {yearError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">{yearError}</div>}
                            {yearSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm mb-4">{yearSuccess}</div>}
                            <form onSubmit={handleAddYear} className="flex gap-4 items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium">Add New Year (YYYY-YYYY)</label>
                                    <input type="text" value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="e.g., 2025-2026" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <button type="submit" disabled={isAddingYear} className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                                    {isAddingYear ? 'Adding...' : 'Add Year'}
                                </button>
                            </form>
                            <div className="mt-4">
                                <h3 className="text-md font-medium">Existing Years:</h3>
                                <ul className="list-disc list-inside text-sm mt-2">
                                    {academicYears.map(year => <li key={year}>{year}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold border-b pb-3 mb-4">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{passwordError}</div>}
                            {passwordSuccess && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{passwordSuccess}</div>}
                            <div>
                                <label className="block text-sm font-medium">Old Password</label>
                                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md"/>
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={isChangingPassword} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                    {isChangingPassword ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {user.role === UserRole.Admin && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4">Data Management</h2>
                            <p className="text-sm text-gray-600 mb-4">Backup or restore all application data for all academic years.</p>
                            
                            {dataError && <div className="my-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{dataError}</div>}
                            {dataSuccess && <div className="my-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{dataSuccess}</div>}

                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleBackup} disabled={isBackingUp || isRestoring} className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                                    {ICONS.backup} <span className="ml-2">{isBackingUp ? 'Backing up...' : 'Backup Data'}</span>
                                </button>
                                <button onClick={triggerRestore} disabled={isRestoring || isBackingUp} className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                                    {ICONS.restore} <span className="ml-2">{isRestoring ? 'Restoring...' : 'Restore Data'}</span>
                                </button>
                                <input type="file" ref={restoreInputRef} onChange={handleRestore} accept=".json" className="hidden"/>
                            </div>
                            <p className="text-xs text-red-500 mt-3 text-center"><strong>Warning:</strong> Restoring data will overwrite all current information.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
