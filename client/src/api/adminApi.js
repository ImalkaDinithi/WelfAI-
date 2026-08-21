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
