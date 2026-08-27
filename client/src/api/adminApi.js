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

// Lifestyle Improvement Plan API
export const getPlansForReview = async (filter = 'active') => {
  const { data } = await axiosInstance.get('/admin/lifestyle-plans', {
    params: { filter },
  });
  return data;
};

export const markPlanUnderReview = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/lifestyle-plans/${id}/review-start`);
  return data;
};

export const runMlPrediction = async (id, adminReviewNotes) => {
  const { data } = await axiosInstance.post(`/admin/lifestyle-plans/${id}/predict`, {
    adminReviewNotes,
  });
  return data;
};

export const getPlanProgress = async (id) => {
  const { data } = await axiosInstance.get(`/admin/lifestyle-plans/${id}/progress`);
  return data;
};

export const reviewPlanPeriod = async (id, periodLabel, reviewNotes) => {
  const { data } = await axiosInstance.patch(`/admin/lifestyle-plans/${id}/progress/review`, {
    periodLabel,
    reviewNotes,
  });
  return data;
};

export const disqualifyApplication = async (id, reason) => {
  const { data } = await axiosInstance.patch(`/admin/applications/${id}/disqualify`, {
    reason,
  });
  return data;
};

export const getWaitingListApplications = async (filter = 'active') => {
  const { data } = await axiosInstance.get('/admin/waiting-list', {
    params: { filter },
  });
  return data;
};

export const resolveWaitingList = async (id, decision, resolvedNotes) => {
  const { data } = await axiosInstance.patch(`/admin/waiting-list/${id}/resolve`, {
    decision,
    resolvedNotes,
  });
  return data;
};
