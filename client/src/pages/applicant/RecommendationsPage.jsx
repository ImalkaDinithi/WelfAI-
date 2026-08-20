import { useState } from 'react';

const RecommendationsPage = () => {
  // Structured to easily map recommendations array from future ML service API
  const [recommendations] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Smart Economic Recommendations
        </h1>
        <p className="text-sm text-slate-500">
          Personalized income-enhancement, vocational training, and subsidy guidance tailored for your household.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-800 text-2xl">
            💡
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Recommendations Module — Coming Soon
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Once your application is reviewed, WelfAI's Machine Learning recommendation engine will match your household profile with tailored government skill development programs, agricultural subsidies, and employment initiatives.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
              Future ML Integration Ready
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="font-serif text-base font-bold text-slate-900">{rec.title}</h4>
              <p className="mt-1 text-xs text-slate-600">{rec.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
