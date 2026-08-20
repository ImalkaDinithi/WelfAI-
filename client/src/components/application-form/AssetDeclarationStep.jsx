import FormField from '../FormField';

const AssetDeclarationStep = ({ data = {}, onChange, errors = {} }) => {
  const handleToggle = (name, value) => {
    onChange(name, value);
    if (name === 'ownsVehicle' && !value) {
      onChange('numberOfVehicles', 0);
    }
    if (name === 'ownsProperty' && !value) {
      onChange('numberOfProperties', 0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value === '' ? '' : Math.max(0, Number(value)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Asset & Ownership Declaration
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Declare household ownership of motor vehicles, property, business, and agricultural land.
        </p>
      </div>

      <div className="space-y-6">
        {/* Vehicles */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="block text-base font-medium text-slate-900">
                Motor Vehicles Ownership
              </span>
              <span className="text-xs text-slate-500">
                Includes cars, vans, motorbikes, three-wheelers, tractors
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleToggle('ownsVehicle', true)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsVehicle === true
                    ? 'bg-teal-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleToggle('ownsVehicle', false)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsVehicle === false
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {data.ownsVehicle && (
            <div className="mt-4 border-t border-slate-100 pt-4 max-w-xs">
              <FormField
                label="Number of Vehicles Owned"
                type="number"
                name="numberOfVehicles"
                value={data.numberOfVehicles ?? 1}
                onChange={handleInputChange}
                min="1"
                error={errors.numberOfVehicles}
                required
              />
            </div>
          )}

          {errors.ownsVehicle && (
            <p className="mt-2 text-xs text-red-600">{errors.ownsVehicle}</p>
          )}
        </div>

        {/* Real Estate / Property */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="block text-base font-medium text-slate-900">
                Land & Real Estate Property Ownership
              </span>
              <span className="text-xs text-slate-500">
                Includes commercial, residential land, or houses other than primary residence
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleToggle('ownsProperty', true)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsProperty === true
                    ? 'bg-teal-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleToggle('ownsProperty', false)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsProperty === false
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {data.ownsProperty && (
            <div className="mt-4 border-t border-slate-100 pt-4 max-w-xs">
              <FormField
                label="Number of Additional Properties"
                type="number"
                name="numberOfProperties"
                value={data.numberOfProperties ?? 1}
                onChange={handleInputChange}
                min="1"
                error={errors.numberOfProperties}
                required
              />
            </div>
          )}

          {errors.ownsProperty && (
            <p className="mt-2 text-xs text-red-600">{errors.ownsProperty}</p>
          )}
        </div>

        {/* Registered Business */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="block text-base font-medium text-slate-900">
                Registered Business Ownership
              </span>
              <span className="text-xs text-slate-500">
                Sole proprietorship, partnership, or private enterprise
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleToggle('ownsBusiness', true)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsBusiness === true
                    ? 'bg-teal-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleToggle('ownsBusiness', false)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsBusiness === false
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
          {errors.ownsBusiness && (
            <p className="mt-2 text-xs text-red-600">{errors.ownsBusiness}</p>
          )}
        </div>

        {/* Agricultural Land */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="block text-base font-medium text-slate-900">
                Agricultural Land Ownership
              </span>
              <span className="text-xs text-slate-500">
                Paddy land, tea/rubber/coconut estates, cultivated land
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleToggle('ownsAgriculturalLand', true)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsAgriculturalLand === true
                    ? 'bg-teal-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleToggle('ownsAgriculturalLand', false)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  data.ownsAgriculturalLand === false
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
          {errors.ownsAgriculturalLand && (
            <p className="mt-2 text-xs text-red-600">{errors.ownsAgriculturalLand}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDeclarationStep;
