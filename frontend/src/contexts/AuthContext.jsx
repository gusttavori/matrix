import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Buscar dados atualizados da instituição
        fetchInstitutionData();
      } catch {
        logout();
      }
    }

    setLoading(false);
  }, []);

  const fetchInstitutionData = async () => {
    try {
      const response = await api.get('/api/institutions/me');
      if (response.data.success) {
        setInstitution(response.data.data.institution);
        setSubscription(response.data.data.subscription);
      }
    } catch {
      // silently fail - institution data will load on next request
    }
  };

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });

    if (response.data.success) {
      const { token, user: userData, institution: instData, subscription: subData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setInstitution(instData);
      setSubscription(subData);

      return userData;
    }

    throw new Error(response.data.message);
  }, []);

  const register = useCallback(async (data) => {
    const response = await api.post('/api/auth/register', data);

    if (response.data.success) {
      const { token, user: userData, institution: instData, subscription: subData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setInstitution(instData);
      setSubscription(subData);

      return userData;
    }

    throw new Error(response.data.message);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setInstitution(null);
    setSubscription(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isSecretary = user?.role === 'SECRETARY';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{
      user,
      institution,
      subscription,
      loading,
      isAuthenticated,
      isAdmin,
      isSecretary,
      isTeacher,
      isStudent,
      login,
      register,
      logout,
      fetchInstitutionData
    }}>
      {children}
    </AuthContext.Provider>
  );
}
