import { useState } from 'react';
import FormField from '../FormField';

const EducationSkillsStep = ({ data = {}, onChange, errors = {} }) => {
  const [skillInput, setSkillInput] = useState('');

  const skillsList = Array.isArray(data.professionalSkills)
    ? data.professionalSkills
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skillsList.includes(trimmed)) {
        onChange('professionalSkills', [...skillsList, trimmed]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(
      'professionalSkills',
      skillsList.filter((s) => s !== skillToRemove)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Education & Vocational Skills
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Provide educational background and practical skills of the main applicant.
        </p>
      </div>

      <div className="space-y-4">
        {/* Highest Qualification */}
        <div>
          <label
            htmlFor="highestEducationalQualification"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Highest Educational Qualification <span className="ml-0.5 text-amber-600">*</span>
          </label>
          <select
            id="highestEducationalQualification"
            name="highestEducationalQualification"
            value={data.highestEducationalQualification || ''}
            onChange={handleInputChange}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.highestEducationalQualification
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
          >
            <option value="">Select Qualification</option>
            <option value="No Schooling">No Schooling</option>
            <option value="Primary">Primary</option>
            <option value="O-Level">O-Level (G.C.E. O/L)</option>
            <option value="A-Level">A-Level (G.C.E. A/L)</option>
            <option value="Diploma">Diploma</option>
            <option value="Degree">Bachelor Degree</option>
            <option value="Postgraduate">Postgraduate Degree</option>
          </select>
          {errors.highestEducationalQualification && (
            <p className="mt-1 text-xs text-red-600">
              {errors.highestEducationalQualification}
            </p>
          )}
        </div>

        <FormField
          label="Vocational / Technical Training"
          name="vocationalTraining"
          value={data.vocationalTraining || ''}
          onChange={handleInputChange}
          placeholder="e.g. Carpentry, Electrician Certificate, NVQ Level 3 (Optional)"
          error={errors.vocationalTraining}
        />

        {/* Tag-style Professional Skills Input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Professional / Technical Skills (Optional)
          </label>
          <p className="mb-2 text-xs text-slate-500">
            Type a skill and press <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">Enter</kbd> to add.
          </p>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="e.g. Tailoring, Plumbing, Welding..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />

          {skillsList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 border border-teal-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1.5 text-teal-600 hover:text-teal-900 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationSkillsStep;
