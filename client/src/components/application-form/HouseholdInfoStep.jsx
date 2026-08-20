import FormField from '../FormField';

const HouseholdInfoStep = ({ data = {}, onChange, errors = {} }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Parse numeric inputs as numbers or empty string
    const parsedValue = value === '' ? '' : Math.max(0, Number(value));
    onChange(name, parsedValue);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Household Information
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Provide information about the members living in your household and monthly expenditure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <FormField
          label="Total Number of Family Members"
          type="number"
          name="numberOfFamilyMembers"
          value={data.numberOfFamilyMembers ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 4"
          min="1"
          error={errors.numberOfFamilyMembers}
          required
        />

        <FormField
          label="Number of Income Earners"
          type="number"
          name="numberOfIncomeEarners"
          value={data.numberOfIncomeEarners ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 1"
          min="0"
          error={errors.numberOfIncomeEarners}
          required
        />

        <FormField
          label="Number of Children (< 18 yrs)"
          type="number"
          name="numberOfChildren"
          value={data.numberOfChildren ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 2"
          min="0"
          error={errors.numberOfChildren}
          required
        />

        <FormField
          label="Number of Elderly Dependents (> 60 yrs)"
          type="number"
          name="numberOfElderlyDependents"
          value={data.numberOfElderlyDependents ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 1"
          min="0"
          error={errors.numberOfElderlyDependents}
          required
        />

        <FormField
          label="Number of Differently Abled Members"
          type="number"
          name="numberOfDisabledMembers"
          value={data.numberOfDisabledMembers ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 0"
          min="0"
          error={errors.numberOfDisabledMembers}
          required
        />

        <FormField
          label="Estimated Monthly Household Expenses (LKR)"
          type="number"
          name="monthlyHouseholdExpenses"
          value={data.monthlyHouseholdExpenses ?? ''}
          onChange={handleInputChange}
          placeholder="e.g. 45000"
          min="0"
          error={errors.monthlyHouseholdExpenses}
          required
        />
      </div>
    </div>
  );
};

export default HouseholdInfoStep;
