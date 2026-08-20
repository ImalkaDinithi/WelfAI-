import FormField from '../FormField';

const IncomeInfoStep = ({ data = {}, onChange, errors = {} }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === '' ? '' : Math.max(0, Number(value));
    onChange(name, parsedValue);
  };

  const salary = Number(data.salaryIncome) || 0;
  const business = Number(data.businessIncome) || 0;
  const agricultural = Number(data.agriculturalIncome) || 0;
  const pension = Number(data.pensionIncome) || 0;
  const other = Number(data.otherIncome) || 0;

  const computedSum = salary + business + agricultural + pension + other;
  const declaredTotal = Number(data.totalMonthlyHouseholdIncome) || 0;
  const isSumMatching = computedSum === declaredTotal;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Household Income Breakdown
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter total monthly household income and break down by source in Sri Lankan Rupees (LKR).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField
            label="Total Monthly Household Income (LKR)"
            type="number"
            name="totalMonthlyHouseholdIncome"
            value={data.totalMonthlyHouseholdIncome ?? ''}
            onChange={handleInputChange}
            placeholder="e.g. 50000"
            min="0"
            error={errors.totalMonthlyHouseholdIncome}
            required
          />
        </div>

        <FormField
          label="Salary / Wage Income (LKR)"
          type="number"
          name="salaryIncome"
          value={data.salaryIncome ?? ''}
          onChange={handleInputChange}
          placeholder="0"
          min="0"
          error={errors.salaryIncome}
        />

        <FormField
          label="Business / Self-Employment Income (LKR)"
          type="number"
          name="businessIncome"
          value={data.businessIncome ?? ''}
          onChange={handleInputChange}
          placeholder="0"
          min="0"
          error={errors.businessIncome}
        />

        <FormField
          label="Agricultural Income (LKR)"
          type="number"
          name="agriculturalIncome"
          value={data.agriculturalIncome ?? ''}
          onChange={handleInputChange}
          placeholder="0"
          min="0"
          error={errors.agriculturalIncome}
        />

        <FormField
          label="Pension Income (LKR)"
          type="number"
          name="pensionIncome"
          value={data.pensionIncome ?? ''}
          onChange={handleInputChange}
          placeholder="0"
          min="0"
          error={errors.pensionIncome}
        />

        <div className="md:col-span-2">
          <FormField
            label="Other Income / Remittances (LKR)"
            type="number"
            name="otherIncome"
            value={data.otherIncome ?? ''}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            error={errors.otherIncome}
          />
        </div>
      </div>

      {/* Live Computed Income Breakdown Summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Sum of Itemized Income Sources:
          </span>
          <span className="font-mono text-base font-semibold text-slate-900">
            LKR {computedSum.toLocaleString()}
          </span>
        </div>
        {declaredTotal > 0 && (
          <div className="mt-2 text-xs">
            {isSumMatching ? (
              <span className="font-medium text-teal-700">
                ✓ Itemized sum matches declared total household income.
              </span>
            ) : (
              <span className="font-medium text-amber-700">
                ⚠️ Itemized sum (LKR {computedSum.toLocaleString()}) differs from declared total (LKR {declaredTotal.toLocaleString()}).
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeInfoStep;
