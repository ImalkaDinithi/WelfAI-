import { useState, useEffect } from 'react';
import FormField from '../FormField';
import { getDistricts, getDsDivisions, getGnDivisions } from '../../api/locationApi';

const PersonalInfoStep = ({ data = {}, onChange, errors = {} }) => {
  const [districts, setDistricts] = useState([]);
  const [dsDivisions, setDsDivisions] = useState([]);
  const [gnDivisions, setGnDivisions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({
    districts: false,
    ds: false,
    gn: false,
  });

  // Fetch districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingLocations((prev) => ({ ...prev, districts: true }));
      try {
        const list = await getDistricts();
        setDistricts(list);
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingLocations((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, []);

  // Fetch DS Divisions when district changes
  useEffect(() => {
    if (!data.district) {
      setDsDivisions([]);
      setGnDivisions([]);
      return;
    }
    const fetchDs = async () => {
      setLoadingLocations((prev) => ({ ...prev, ds: true }));
      try {
        const list = await getDsDivisions(data.district);
        setDsDivisions(list);
      } catch (err) {
        console.error('Failed to load DS divisions:', err);
      } finally {
        setLoadingLocations((prev) => ({ ...prev, ds: false }));
      }
    };
    fetchDs();
  }, [data.district]);

  // Fetch GN Divisions when DS division changes
  useEffect(() => {
    if (!data.dsDivision) {
      setGnDivisions([]);
      return;
    }
    const fetchGn = async () => {
      setLoadingLocations((prev) => ({ ...prev, gn: true }));
      try {
        const list = await getGnDivisions(data.dsDivision, data.district);
        setGnDivisions(list);
      } catch (err) {
        console.error('Failed to load GN divisions:', err);
      } finally {
        setLoadingLocations((prev) => ({ ...prev, gn: false }));
      }
    };
    fetchGn();
  }, [data.dsDivision, data.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    onChange('district', selectedDistrict);
    onChange('dsDivision', '');
    onChange('gnDivision', '');
  };

  const handleDsChange = (e) => {
    const selectedDs = e.target.value;
    onChange('dsDivision', selectedDs);
    onChange('gnDivision', '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Personal Information
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Please enter the applicant's official personal and contact details as per the National Identity Card.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <FormField
          label="NIC Number"
          name="nicNumber"
          value={data.nicNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. 199012345678 or 901234567V"
          error={errors.nicNumber}
          required
        />

        <FormField
          label="Full Name"
          name="fullName"
          value={data.fullName || ''}
          onChange={handleInputChange}
          placeholder="Enter full legal name"
          error={errors.fullName}
          required
        />

        <FormField
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''}
          onChange={handleInputChange}
          error={errors.dateOfBirth}
          required
        />

        {/* Gender Dropdown */}
        <div className="mb-5">
          <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-700">
            Gender <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={data.gender || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.gender
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
        </div>

        {/* Marital Status Dropdown */}
        <div className="mb-5">
          <label htmlFor="maritalStatus" className="mb-1.5 block text-sm font-medium text-slate-700">
            Marital Status <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={data.maritalStatus || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.maritalStatus
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="mt-1 text-xs text-red-600">{errors.maritalStatus}</p>
          )}
        </div>

        <FormField
          label="Mobile Number"
          name="mobileNumber"
          value={data.mobileNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. 0712345678"
          error={errors.mobileNumber}
          required
        />

        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={data.email || ''}
          onChange={handleInputChange}
          placeholder="you@example.com (Optional)"
          error={errors.email}
        />

        <div className="md:col-span-2">
          <FormField
            label="Residential Address"
            name="address"
            value={data.address || ''}
            onChange={handleInputChange}
            placeholder="Street address, house number"
            error={errors.address}
            required
          />
        </div>

        {/* District Dropdown */}
        <div className="mb-5">
          <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-slate-700">
            District <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="district"
            name="district"
            value={data.district || ''}
            onChange={handleDistrictChange}
            disabled={loadingLocations.districts}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.district
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">
              {loadingLocations.districts ? 'Loading Districts...' : 'Select District'}
            </option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
        </div>

        {/* DS Division Dropdown */}
        <div className="mb-5">
          <label htmlFor="dsDivision" className="mb-1.5 block text-sm font-medium text-slate-700">
            DS Division <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="dsDivision"
            name="dsDivision"
            value={data.dsDivision || ''}
            onChange={handleDsChange}
            disabled={!data.district || loadingLocations.ds}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              errors.dsDivision
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">
              {!data.district
                ? 'Select District First'
                : loadingLocations.ds
                ? 'Loading DS Divisions...'
                : 'Select DS Division'}
            </option>
            {dsDivisions.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
          {errors.dsDivision && <p className="mt-1 text-xs text-red-600">{errors.dsDivision}</p>}
        </div>

        {/* GN Division Dropdown */}
        <div className="mb-5 md:col-span-2">
          <label htmlFor="gnDivision" className="mb-1.5 block text-sm font-medium text-slate-700">
            GN Division <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="gnDivision"
            name="gnDivision"
            value={data.gnDivision || ''}
            onChange={handleInputChange}
            disabled={!data.dsDivision || loadingLocations.gn}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              errors.gnDivision
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">
              {!data.dsDivision
                ? 'Select DS Division First'
                : loadingLocations.gn
                ? 'Loading GN Divisions...'
                : 'Select GN Division'}
            </option>
            {gnDivisions.map((gn) => (
              <option key={gn} value={gn}>
                {gn}
              </option>
            ))}
          </select>
          {errors.gnDivision && <p className="mt-1 text-xs text-red-600">{errors.gnDivision}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
