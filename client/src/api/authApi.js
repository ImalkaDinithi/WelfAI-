import axiosInstance from './axiosInstance';

export const registerUser = async (formData) => {
  const { data } = await axiosInstance.post('/auth/register', formData);
  return data;
};

export const loginUser = async (formData) => {
  const { data } = await axiosInstance.post('/auth/login', formData);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get('/auth/me');
  return data;
};
