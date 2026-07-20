import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser, registerUser } from '../api/authApi';
import { setAuthToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const saveAuth = (token, profile = null) => {
    if (!token) {
      setAuthToken(null);
      setUser(null);
      return null;
    }

    setAuthToken(token);

    const decoded = jwtDecode(token);
    const authUser = {
      token,
      userId: decoded.userId || decoded.id,
      role: decoded.role || 'applicant',
      ...profile,
    };

    setUser(authUser);
    return authUser;
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    return saveAuth(data.token, data);
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    return saveAuth(data.token, data);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveAuth }}>
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
