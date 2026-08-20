import FormField from '../FormField';

const HousingInfoStep = ({ data = {}, onChange, errors = {} }) => {
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : Math.max(1, Number(value))) : value;
    onChange(name, val);
  };

  const handleToggle = (name, value) => {
    onChange(name, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Housing & Living Conditions
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Details regarding physical dwelling, building materials, and essential services.
        </p>
      </div>

      <div className="space-y-5">
        {/* House Ownership Radio Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            House Ownership <span className="text-amber-600">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {['Owned', 'Rented', 'Other'].map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  data.houseOwnership === option
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="houseOwnership"
                  value={option}
                  checked={data.houseOwnership === option}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-800 focus:ring-teal-500"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
          {errors.houseOwnership && (
            <p className="mt-1 text-xs text-red-600">{errors.houseOwnership}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <FormField
            label="House Type"
            name="houseType"
            value={data.houseType || ''}
            onChange={handleInputChange}
            placeholder="e.g. Single Story, Apartment, Temporary Structure"
            error={errors.houseType}
            required
          />

          <FormField
            label="Number of Living Rooms / Bedrooms"
            type="number"
            name="numberOfRooms"
            value={data.numberOfRooms ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. 3"
            min="1"
            error={errors.numberOfRooms}
            required
          />

          <FormField
            label="Roof Material"
            name="roofMaterial"
            value={data.roofMaterial || ''}
            onChange={handleInputChange}
            placeholder="e.g. Asbestos Sheets, Clay Tiles, Zinc Sheets"
            error={errors.roofMaterial}
            required
          />

          <FormField
            label="Wall Material"
            name="wallMaterial"
            value={data.wallMaterial || ''}
            onChange={handleInputChange}
            placeholder="e.g. Brick, Cement Block, Mud, Wood"
            error={errors.wallMaterial}
            required
          />

          <FormField
            label="Floor Material"
            name="floorMaterial"
            value={data.floorMaterial || ''}
            onChange={handleInputChange}
            placeholder="e.g. Tile, Cement, Clay/Mud"
            error={errors.floorMaterial}
            required
          />

          <FormField
            label="Toilet Facilities"
            name="toiletFacilities"
            value={data.toiletFacilities || ''}
            onChange={handleInputChange}
            placeholder="e.g. Flush toilet (private), Pit latrine, Shared"
            error={errors.toiletFacilities}
            required
          />
        </div>

        {/* Toggles for Utilities */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          {/* Access to Electricity */}
          <div>
            <div className={`flex items-center justify-between rounded-lg border p-4 ${
              errors.accessToElectricity ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <span className="block text-sm font-medium text-slate-800">
                  Access to Main Electricity Grid
                </span>
                <span className="text-xs text-slate-500">CEB or LECO connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggle('accessToElectricity', true)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    data.accessToElectricity === true
                      ? 'bg-teal-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('accessToElectricity', false)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    data.accessToElectricity === false
                      ? 'bg-amber-800 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            {errors.accessToElectricity && (
              <p className="mt-1 text-xs text-red-600">{errors.accessToElectricity}</p>
            )}
          </div>

          {/* Access to Clean Water */}
          <div>
            <div className={`flex items-center justify-between rounded-lg border p-4 ${
              errors.accessToCleanWater ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <span className="block text-sm font-medium text-slate-800">
                  Access to Pipe-Borne Clean Water
                </span>
                <span className="text-xs text-slate-500">NWSDB tap or protected well</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggle('accessToCleanWater', true)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    data.accessToCleanWater === true
                      ? 'bg-teal-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('accessToCleanWater', false)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    data.accessToCleanWater === false
                      ? 'bg-amber-800 text-white'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            {errors.accessToCleanWater && (
              <p className="mt-1 text-xs text-red-600">{errors.accessToCleanWater}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousingInfoStep;
