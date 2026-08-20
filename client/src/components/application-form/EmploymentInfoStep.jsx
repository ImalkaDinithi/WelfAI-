import FormField from '../FormField';

const EmploymentInfoStep = ({ data = {}, onChange, errors = {} }) => {
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : Math.max(0, Number(value))) : value;
    onChange(name, val);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onChange('employmentStatus', newStatus);
    if (newStatus === 'Unemployed') {
      onChange('occupation', '');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Employment Information
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Provide details about the main applicant's primary employment or business status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {/* Employment Status */}
        <div className="mb-5">
          <label htmlFor="employmentStatus" className="mb-1.5 block text-sm font-medium text-slate-700">
            Employment Status <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="employmentStatus"
            name="employmentStatus"
            value={data.employmentStatus || ''}
            onChange={handleStatusChange}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.employmentStatus
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">Select Employment Status</option>
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Retired">Retired</option>
          </select>
          {errors.employmentStatus && (
            <p className="mt-1 text-xs text-red-600">{errors.employmentStatus}</p>
          )}
        </div>

        {/* Employment Type */}
        <div className="mb-5">
          <label htmlFor="employmentType" className="mb-1.5 block text-sm font-medium text-slate-700">
            Employment Type <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="employmentType"
            name="employmentType"
            value={data.employmentType || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.employmentType
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">Select Employment Type</option>
            <option value="Permanent">Permanent</option>
            <option value="Temporary">Temporary</option>
            <option value="Contract">Contract</option>
            <option value="Daily-Wage">Daily-Wage</option>
            <option value="None">None</option>
          </select>
          {errors.employmentType && (
            <p className="mt-1 text-xs text-red-600">{errors.employmentType}</p>
          )}
        </div>

        {/* Occupation (Shown only if employmentStatus !== 'Unemployed') */}
        {data.employmentStatus && data.employmentStatus !== 'Unemployed' && (
          <FormField
            label="Occupation / Job Title"
            name="occupation"
            value={data.occupation || ''}
            onChange={handleInputChange}
            placeholder="e.g. Mason, Shop Keeper, Teacher"
            error={errors.occupation}
            required
          />
        )}

        <FormField
          label="Employer / Business Name"
          name="employerName"
          value={data.employerName || ''}
          onChange={handleInputChange}
          placeholder="e.g. ABC Trading Co. (Optional)"
          error={errors.employerName}
        />

        <FormField
          label="Years of Employment"
          type="number"
          name="yearsOfEmployment"
          value={data.yearsOfEmployment ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 5 (Optional)"
          min="0"
          error={errors.yearsOfEmployment}
        />
      </div>
    </div>
  );
};

export default EmploymentInfoStep;
