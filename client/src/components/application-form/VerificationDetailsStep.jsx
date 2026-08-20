import { useState } from 'react';
import FormField from '../FormField';

const VerificationDetailsStep = ({ data = {}, onChange, errors = {} }) => {
  const [showAccount, setShowAccount] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          External Verification & Bank Details
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter utility and bank details for automated verification and direct benefit transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <FormField
          label="Bank Name"
          name="bankName"
          value={data.bankName || ''}
          onChange={handleInputChange}
          placeholder="e.g. Bank of Ceylon, People's Bank, Commercial Bank"
          error={errors.bankName}
          required
        />

        {/* Bank Account Number with Show/Hide Password-style toggle */}
        <div className="mb-5">
          <label
            htmlFor="bankAccountNumber"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Bank Account Number <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <div className="relative">
            <input
              id="bankAccountNumber"
              name="bankAccountNumber"
              type={showAccount ? 'text' : 'password'}
              value={data.bankAccountNumber || ''}
              onChange={handleInputChange}
              placeholder="Enter account number"
              className={`w-full rounded-lg border px-4 py-2.5 pr-12 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
                errors.bankAccountNumber
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowAccount(!showAccount)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-800 hover:text-teal-900 focus:outline-none"
            >
              {showAccount ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.bankAccountNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.bankAccountNumber}</p>
          )}
        </div>

        <FormField
          label="CEB / LECO Electricity Account Number"
          name="electricityAccountNumber"
          value={data.electricityAccountNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. 1234567890"
          error={errors.electricityAccountNumber}
          required
        />

        <FormField
          label="NWSDB Water Account Number"
          name="waterAccountNumber"
          value={data.waterAccountNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. 9876543210 (Optional)"
          error={errors.waterAccountNumber}
        />
      </div>
    </div>
  );
};

export default VerificationDetailsStep;
