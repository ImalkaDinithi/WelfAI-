import axiosInstance from './axiosInstance';

export const getDistricts = async () => {
  const { data } = await axiosInstance.get('/locations/districts');
  return data.data || [];
};

export const getDsDivisions = async (district) => {
  if (!district) return [];
  const { data } = await axiosInstance.get(
    `/locations/ds-divisions?district=${encodeURIComponent(district)}`
  );
  return data.data || [];
};

export const getGnDivisions = async (dsDivision, district) => {
  if (!dsDivision) return [];
  let url = `/locations/gn-divisions?dsDivision=${encodeURIComponent(dsDivision)}`;
  if (district) {
    url += `&district=${encodeURIComponent(district)}`;
  }
  const { data } = await axiosInstance.get(url);
  return data.data || [];
};
