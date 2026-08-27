import axiosInstance from './axiosInstance';

export const getMyApplication = async () => {
  const { data } = await axiosInstance.get('/applications/me');
  return data;
};

export const saveDraft = async (sectionData) => {
  const { data } = await axiosInstance.put('/applications/draft', sectionData);
  return data;
};

export const submitApplication = async () => {
  const { data } = await axiosInstance.post('/applications/submit');
  return data;
};

export const uploadDocument = async (applicationId, formData) => {
  const { data } = await axiosInstance.post(
    `/applications/${applicationId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
};

export const deleteDocument = async (applicationId, documentId) => {
  const { data } = await axiosInstance.delete(
    `/applications/${applicationId}/documents/${documentId}`
  );
  return data;
};

export const submitAppeal = async (groundsForAppeal, appealText, contactPreference) => {
  const { data } = await axiosInstance.post('/applications/appeal', {
    groundsForAppeal,
    appealText,
    contactPreference,
  });
  return data;
};

export const uploadAppealDocument = async (formData) => {
  const { data } = await axiosInstance.post('/applications/appeal/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const submitLifestylePlan = async (
  focusAreas,
  goals,
  actionSteps,
  supportRequested,
  requestedDurationMonths
) => {
  const { data } = await axiosInstance.post('/applications/lifestyle-plan', {
    focusAreas,
    goals,
    actionSteps,
    supportRequested,
    requestedDurationMonths,
  });
  return data;
};

export const uploadPlanEvidence = async (file, periodLabel, documentType) => {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('periodLabel', periodLabel);
  formData.append('documentType', documentType);

  const { data } = await axiosInstance.post('/applications/lifestyle-plan/evidence', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deletePlanEvidence = async (documentId) => {
  const { data } = await axiosInstance.delete(`/applications/lifestyle-plan/evidence/${documentId}`);
  return data;
};
