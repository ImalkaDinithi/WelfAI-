import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem('welfai_user');
    const storedToken = localStorage.getItem('welfai_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('welfai_token', token);
    localStorage.setItem('welfai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    persistSession(res.data);
    return res.data;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    persistSession(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('welfai_token');
    localStorage.removeItem('welfai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
