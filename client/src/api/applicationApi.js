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
