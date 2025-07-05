import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { UserRole, AcademicYear } from '../types';
import { api } from '../services/mockApi';

const roleEnumMap: { [key: string]: UserRole | undefined } = {
    'admin': UserRole.Admin,
    'teacher': UserRole.Teacher,
    'student': UserRole.Student,
    'parent': UserRole.Parent
};


const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [availableYears, setAvailableYears] = useState<AcademicYear[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const { login } = useAuth();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = useMemo(() => searchParams.get('role'), [searchParams]);

  useEffect(() => {
    if (!role || !['admin', 'teacher', 'student', 'parent'].includes(role)) {
      navigate('/select-role');
    }
    
    setPassword('');
    setAcademicYear('');
    setError('');

    if (role === 'admin') {
        setIdentifier('admin'); // Automatically set the identifier for the admin
        setLoadingYears(true);
        api.getAcademicYears()
            .then(years => {
                setAvailableYears(years);
                if (years.length > 0) {
                    setAcademicYear(years[0]); // Set current year as default
                }
            })
            .catch(err => setError("Could not load academic years."))
            .finally(() => setLoadingYears(false));
    } else {
        setIdentifier(''); // Clear identifier for other roles
    }
  }, [role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'admin' && !academicYear) {
        setError('Please select an academic year.');
        return;
    }
    
    setLoading(true);
    try {
      if (!role) {
          throw new Error("No role selected. Please go back and select a role.");
      }
      const userRole = roleEnumMap[role];
      if (!userRole) {
          throw new Error("Invalid role specified.");
      }
      await login(identifier, password, userRole, academicYear || undefined);
    } catch (err) {
      setError(`Incorrect ID or password. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getLoginTitle = () => {
    if (!role) return 'Login';
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
  }

  const getIdentifierLabel = () => {
    if (role === 'admin') return 'User ID';
    return 'Registered Mobile Number';
  }

  const getIdentifierPlaceholder = () => {
    if (role === 'admin') return 'admin';
    return 'e.g., 9876543210';
  }

  if (!role || !roleEnumMap[role]) {
      return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {getLoginTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in to the {APP_NAME} portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getIdentifierLabel()}
              </label>
              <div className="mt-1">
                {role === 'admin' ? (
                   <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value="ADMINISTRATOR"
                    readOnly
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 sm:text-sm bg-gray-100 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white/70 cursor-not-allowed"
                  />
                ) : (
                  <input
                    id="identifier"
                    name="identifier"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={getIdentifierPlaceholder()}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: Ghonse@123"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>
            
             {role === 'admin' && (
                <div>
                    <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Academic Year
                    </label>
                    <div className="mt-1">
                        <select
                            id="academicYear"
                            name="academicYear"
                            required
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            disabled={loadingYears}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">{loadingYears ? 'Loading years...' : 'Select Academic Year'}</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
              <button
                type="submit"
                disabled={loading || (role === 'admin' && (!academicYear || loadingYears))}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
         <div className="mt-8 text-center">
            <Link to="/select-role" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                &larr; Change Role
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;