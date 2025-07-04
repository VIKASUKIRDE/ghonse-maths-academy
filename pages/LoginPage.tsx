import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { UserRole } from '../types';

const roleEnumMap: { [key: string]: UserRole | undefined } = {
    'admin': UserRole.Admin,
    'teacher': UserRole.Teacher,
    'student': UserRole.Student,
    'parent': UserRole.Parent
};


const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = useMemo(() => searchParams.get('role'), [searchParams]);

  useEffect(() => {
    // If no role is specified, or role is invalid, redirect to the role selection page.
    if (!role || !['admin', 'teacher', 'student', 'parent'].includes(role)) {
      navigate('/select-role');
    }
    // Clear state when role changes
    setIdentifier('');
    setPassword('');
    setError('');
  }, [role, navigate]);

  const isUserLogin = role === 'admin';
  const isMobileLogin = role === 'teacher' || role === 'student' || role === 'parent';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!role) {
          throw new Error("No role selected. Please go back and select a role.");
      }
      const userRole = roleEnumMap[role];
      if (!userRole) {
          throw new Error("Invalid role specified.");
      }
      // For admin, password is required but we mock it. For others, identifier is the mobile number.
      await login(identifier, userRole);
      // Navigation will be handled by the App component on successful login
    } catch (err) {
      const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'selected';
      setError(`Login failed. Please check your credentials for the '${roleName}' role.`);
    } finally {
      setLoading(false);
    }
  };

  const getLoginTitle = () => {
    if (!role) return 'Login';
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
  }
  
  // While redirecting or if role is invalid, don't render the form
  if (!isUserLogin && !isMobileLogin) {
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
            {isUserLogin && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
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
                      placeholder="any password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}
            
            {isMobileLogin && (
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Registered Mobile Number
                </label>
                <div className="mt-1">
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g., 9876543210"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
              <button
                type="submit"
                disabled={loading}
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