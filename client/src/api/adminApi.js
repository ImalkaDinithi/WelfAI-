import axiosInstance from './axiosInstance';

export const getPendingApplications = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/applications', { params });
  return data;
};

export const getApplicationById = async (id) => {
  const { data } = await axiosInstance.get(`/admin/applications/${id}`);
  return data;
};

export const markUnderReview = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/applications/${id}/review-start`);
  return data;
};

export const reviewApplication = async (id, decision, reviewNotes) => {
  const { data } = await axiosInstance.patch(`/admin/applications/${id}/review`, {
    decision,
    reviewNotes,
  });
  return data;
};

export const getAllApplications = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/applications/all', { params });
  return data;
};

export const getAppealedApplications = async (filter = 'active') => {
  const { data } = await axiosInstance.get('/admin/appeals', {
    params: { filter },
  });
  return data;
};

export const reviewAppeal = async (id, decision, reviewNotes) => {
  const { data } = await axiosInstance.patch(`/admin/appeals/${id}/review`, {
    decision,
    reviewNotes,
  });
  return data;
};
