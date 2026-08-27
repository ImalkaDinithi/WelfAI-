import axiosInstance from './axiosInstance';

// @desc    Get Sri Lanka location hierarchy (Province, District, DS, GN)
export const getDivisionsData = async () => {
  const { data } = await axiosInstance.get('/superadmin/divisions');
  return data;
};

// @desc    Get aggregated analytics & breakdown metrics with optional location filters
export const getDashboardSummary = async (filters = {}) => {
  // Clean empty / undefined filter values
  const cleanParams = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] && String(filters[key]).trim() !== '') {
      cleanParams[key] = String(filters[key]).trim();
    }
  });

  const { data } = await axiosInstance.get('/superadmin/dashboard-summary', {
    params: cleanParams,
  });
  return data;
};
