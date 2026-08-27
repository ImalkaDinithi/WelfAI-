import { useState, useEffect, useMemo } from 'react';
import { getDivisionsData } from '../../api/superAdminApi';

const LocationFilter = ({ onChange, disabled = false }) => {
  const [divisionsData, setDivisionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter values
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDsDivision, setSelectedDsDivision] = useState('');
  const [selectedGnDivision, setSelectedGnDivision] = useState('');

  // Fetch divisions hierarchy once on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const res = await getDivisionsData();
        if (res.success && res.data) {
          setDivisionsData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch Sri Lanka divisions:', err);
        setError('Failed to load location hierarchy');
      } finally {
        setLoading(false);
      }
    };
    fetchDivisions();
  }, []);

  // Compute available Provinces
  const provinces = useMemo(() => {
    if (!divisionsData?.districts) return [];
    const set = new Set();
    divisionsData.districts.forEach((d) => {
      if (d.province) set.add(d.province);
    });
    return Array.from(set).sort();
  }, [divisionsData]);

  // Compute available Districts based on selected Province
  const availableDistricts = useMemo(() => {
    if (!divisionsData?.districts) return [];
    if (!selectedProvince) {
      return divisionsData.districts;
    }
    return divisionsData.districts.filter(
      (d) => d.province?.toLowerCase() === selectedProvince.toLowerCase()
    );
  }, [divisionsData, selectedProvince]);

  // Compute available DS Divisions based on selected District
  const availableDsDivisions = useMemo(() => {
    if (!selectedDistrict || !divisionsData?.districts) return [];
    const districtObj = divisionsData.districts.find(
      (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
    );
    return districtObj ? districtObj.dsDivisions : [];
  }, [divisionsData, selectedDistrict]);

  // Compute available GN Divisions based on selected DS Division
  const availableGnDivisions = useMemo(() => {
    if (!selectedDsDivision || !availableDsDivisions.length) return [];
    const dsObj = availableDsDivisions.find(
      (ds) => ds.name.toLowerCase() === selectedDsDivision.toLowerCase()
    );
    return dsObj ? dsObj.gnDivisions : [];
  }, [availableDsDivisions, selectedDsDivision]);

  // Handlers for cascading resets
  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    setSelectedDistrict('');
    setSelectedDsDivision('');
    setSelectedGnDivision('');

    if (onChange) {
      onChange({
        province: prov,
        district: '',
        dsDivision: '',
        gnDivision: '',
      });
    }
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    setSelectedDsDivision('');
    setSelectedGnDivision('');

    // If district is selected and province was empty, optionally sync province
    let currentProv = selectedProvince;
    if (dist && !currentProv && divisionsData?.districts) {
      const distObj = divisionsData.districts.find(
        (d) => d.name.toLowerCase() === dist.toLowerCase()
      );
      if (distObj?.province) {
        currentProv = distObj.province;
        setSelectedProvince(currentProv);
      }
    }

    if (onChange) {
      onChange({
        province: currentProv,
        district: dist,
        dsDivision: '',
        gnDivision: '',
      });
    }
  };

  const handleDsDivisionChange = (e) => {
    const ds = e.target.value;
    setSelectedDsDivision(ds);
    setSelectedGnDivision('');

    if (onChange) {
      onChange({
        province: selectedProvince,
        district: selectedDistrict,
        dsDivision: ds,
        gnDivision: '',
      });
    }
  };

  const handleGnDivisionChange = (e) => {
    const gn = e.target.value;
    setSelectedGnDivision(gn);

    if (onChange) {
      onChange({
        province: selectedProvince,
        district: selectedDistrict,
        dsDivision: selectedDsDivision,
        gnDivision: gn,
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedDsDivision('');
    setSelectedGnDivision('');

    if (onChange) {
      onChange({
        province: '',
        district: '',
        dsDivision: '',
        gnDivision: '',
      });
    }
  };

  const isFiltered = Boolean(
    selectedProvince || selectedDistrict || selectedDsDivision || selectedGnDivision
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-serif text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>🗺️</span>
            <span>Administrative Location Scope Filter</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Narrow analytics by Sri Lanka's 4-tier administrative hierarchy (Province → District → DS Division → GN Division)
          </p>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={disabled || loading}
            className="inline-flex items-center space-x-1 self-start sm:self-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
          >
            <span>✕</span>
            <span>Clear Filters (Reset)</span>
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Province */}
          <div>
            <label
              htmlFor="location-province"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              1. Province
            </label>
            <select
              id="location-province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={disabled || loading}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-800 disabled:opacity-60"
            >
              <option value="">All Provinces (System-wide)</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov} Province
                </option>
              ))}
            </select>
          </div>

          {/* 2. District */}
          <div>
            <label
              htmlFor="location-district"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              2. District
            </label>
            <select
              id="location-district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={disabled || loading}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-800 disabled:opacity-60"
            >
              <option value="">
                {selectedProvince ? `All Districts in ${selectedProvince}` : 'All 25 Districts'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. DS Division */}
          <div>
            <label
              htmlFor="location-ds"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              3. DS Division
            </label>
            <select
              id="location-ds"
              value={selectedDsDivision}
              onChange={handleDsDivisionChange}
              disabled={disabled || loading || !selectedDistrict}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-800 disabled:opacity-60 disabled:bg-slate-100"
            >
              <option value="">
                {selectedDistrict ? `All DS Divisions in ${selectedDistrict}` : 'Select District first'}
              </option>
              {availableDsDivisions.map((ds) => (
                <option key={ds.name} value={ds.name}>
                  {ds.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. GN Division */}
          <div>
            <label
              htmlFor="location-gn"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              4. GN Division
            </label>
            <select
              id="location-gn"
              value={selectedGnDivision}
              onChange={handleGnDivisionChange}
              disabled={disabled || loading || !selectedDsDivision}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-800 disabled:opacity-60 disabled:bg-slate-100"
            >
              <option value="">
                {selectedDsDivision ? `All GN Divisions in ${selectedDsDivision}` : 'Select DS Division first'}
              </option>
              {availableGnDivisions.map((gn) => (
                <option key={gn} value={gn}>
                  {gn}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
