import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole, Batch, BatchName } from '../types';
import { api } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  tempUser: User | null; // For 2-step login (Admin/Teacher)
  loading: boolean;
  login: (identifier: string, role: UserRole) => Promise<void>;
  selectBatch: (batch: BatchName) => void;
  switchBatch: (batch: BatchName) => void;
  logout: () => void;
  availableBatches: Batch[];
  refreshBatches: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);

  const fetchBatches = useCallback(async () => {
    try {
        const batches = await api.getBatches();
        setAvailableBatches(batches);
    } catch (error) {
        console.error("Failed to fetch available batches", error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
        setLoading(true);
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          await fetchBatches();
        } catch (error) {
          console.error("Failed to parse user from localStorage or fetch batches", error);
          localStorage.removeItem('user');
        } finally {
          setLoading(false);
        }
    };
    initializeAuth();
  }, [fetchBatches]);


  const login = useCallback(async (identifier: string, role: UserRole) => {
    setLoading(true);
    try {
      const userData = await api.login(identifier, role);
      if (userData) {
        if ((userData.role === UserRole.Admin || userData.role === UserRole.Teacher) && userData.assignedBatches && userData.assignedBatches.length > 0) {
          // It's a 2-step login, set temp user and wait for batch selection
          setTempUser(userData);
        } else if (userData.role === UserRole.Admin) { // Admin with no assigned batches (can access all)
          setTempUser(userData);
        }
        else {
          // It's a 1-step login for student/parent
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBatch = useCallback((batch: BatchName) => {
    if (!tempUser) return;
    const finalUser = { ...tempUser, currentBatch: batch };
    setUser(finalUser);
    localStorage.setItem('user', JSON.stringify(finalUser));
    setTempUser(null);
  }, [tempUser]);

  const switchBatch = useCallback((batch: BatchName) => {
    if (!user) return; // Should not happen if UI is correct
    
    // Admins and Teachers are the only ones who can switch
    if (user.role === UserRole.Admin || user.role === UserRole.Teacher) {
        const updatedUser = { ...user, currentBatch: batch };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);


  const logout = useCallback(() => {
    setUser(null);
    setTempUser(null);
    localStorage.removeItem('user');
  }, []);

  const refreshBatches = async () => {
      await fetchBatches();
  };

  return (
    <AuthContext.Provider value={{ user, tempUser, loading, login, selectBatch, switchBatch, logout, availableBatches, refreshBatches }}>
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