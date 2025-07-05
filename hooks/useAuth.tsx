import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole, Batch, BatchName, AcademicYear } from '../types';
import { api } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  tempUser: User | null; // For multi-step logins
  loading: boolean;
  login: (identifier: string, password_param: string, role: UserRole, academicYear?: AcademicYear) => Promise<void>;
  selectBatch: (batch: BatchName) => void;
  selectChild: (parentId: string) => void;
  selectAcademicYear: (year: AcademicYear) => void;
  switchAcademicYear: (year: AcademicYear) => void;
  switchBatch: (batch: BatchName) => void;
  logout: () => void;
  changePassword: (userId: string, userRole: UserRole, oldPass: string, newPass: string) => Promise<boolean>;
  backupData: () => Promise<void>;
  availableBatches: Batch[];
  availableAcademicYears: AcademicYear[];
  refreshBatches: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tempUser, setTempUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
    const [availableAcademicYears, setAvailableAcademicYears] = useState<AcademicYear[]>([]);

    const initAuth = useCallback(async () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
            if(parsedUser.academicYear) {
                api.setCurrentAcademicYear(parsedUser.academicYear);
            }
            if (parsedUser.role === UserRole.Admin) {
                const years = await api.getAcademicYears();
                setAvailableAcademicYears(years);
            }
            if (parsedUser.currentBatch) {
                 const batches = await api.getBatches();
                 setAvailableBatches(batches);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const refreshBatches = useCallback(async () => {
        const batches = await api.getBatches();
        setAvailableBatches(batches);
    }, []);

    const login = useCallback(async (identifier: string, password_param: string, role: UserRole, academicYear?: AcademicYear) => {
        setLoading(true);
        try {
            const userData = await api.login(identifier, password_param, role, academicYear);
            if (userData) {
                 // The login page now handles academic year selection for admin. The returned user will either be a full user,
                 // or a temp user that needs batch/child selection. The multi-step for admin year selection is removed.
                if ((userData.role === UserRole.Parent && userData.childrenToSelect) ||
                    ((userData.role === UserRole.Admin || userData.role === UserRole.Teacher) && (userData.assignedBatches?.length ?? 0) > 0 && !userData.currentBatch)) {
                    
                    setTempUser(userData);
                    if (userData.availableAcademicYears) {
                        setAvailableAcademicYears(userData.availableAcademicYears);
                    }
                     const newBatches = await api.getBatches();
                     setAvailableBatches(newBatches);

                } else {
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                     if (userData.academicYear) {
                        api.setCurrentAcademicYear(userData.academicYear);
                     }
                    if (userData.role === UserRole.Admin) {
                        const years = await api.getAcademicYears();
                        setAvailableAcademicYears(years);
                    }
                    const batches = await api.getBatches();
                    setAvailableBatches(batches);
                }
            } else {
                throw new Error('Login failed');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const selectBatch = useCallback((batchName: BatchName) => {
        if (tempUser) {
            const finalUser = { ...tempUser, currentBatch: batchName };
            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            setTempUser(null);
        }
    }, [tempUser]);

    const selectChild = useCallback(async (parentId: string) => {
        if (tempUser && tempUser.childrenToSelect) {
            const childInfo = tempUser.childrenToSelect.find(c => c.parentId === parentId);
            if (childInfo) {
                const finalUser = { ...tempUser, id: parentId, childrenToSelect: undefined, currentBatch: childInfo.childBatch };
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                setTempUser(null);
            }
        }
    }, [tempUser]);
    
    const backupData = useCallback(async () => {
        try {
            const data = await api.getAllData();
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `ghonse-maths-backup-${timestamp}.json`;
            link.click();
        } catch (err) {
            console.error('Failed to create backup.', err);
            throw new Error('Failed to create backup.');
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setTempUser(null);
        localStorage.removeItem('user');
    }, []);

    const selectAcademicYear = useCallback((year: AcademicYear) => {
        // This is a placeholder for an obsolete flow. It should not be called.
        console.warn('selectAcademicYear is part of an obsolete flow and should not be used.');
    }, []);

    const switchAcademicYear = useCallback(async (year: AcademicYear) => {
         if (user && user.role === UserRole.Admin) {
             api.setCurrentAcademicYear(year);
             
             // Refresh available batches for the new year
             const newBatches = await api.getBatches();
             setAvailableBatches(newBatches);

             // The batch needs to be reset, as it might not exist in the new year.
             // We will create a tempUser to force batch selection.
             const newTempUser: User = { 
                 ...user, 
                 academicYear: year, 
                 currentBatch: undefined,
                 assignedBatches: newBatches.map(b => b.name) // Important: update assigned batches
             };

             localStorage.removeItem('user');
             setUser(null);
             setTempUser(newTempUser);
         }
    }, [user]);

    const switchBatch = useCallback((batchName: BatchName) => {
         if (user) {
            const updatedUser = { ...user, currentBatch: batchName };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }, [user]);

    const changePassword = useCallback(async (userId: string, userRole: UserRole, oldPass: string, newPass: string) => {
        const success = await api.changePassword(userId, userRole, oldPass, newPass);
        return success;
    }, []);

    return (
        <AuthContext.Provider value={{ user, tempUser, loading, login, selectBatch, selectChild, logout, switchBatch, switchAcademicYear, changePassword, backupData, availableBatches, availableAcademicYears, refreshBatches, selectAcademicYear }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
