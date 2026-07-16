const stats = [
  { value: '1.6M+', label: 'families assessed under Sri Lanka\u2019s poverty line' },
  { value: '25', label: 'districts covered by geographic scoring' },
  { value: 'AI', label: 'driven eligibility & fraud detection' },
];

const AuthBrandPanel = () => {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-teal-950 px-12 py-14 text-teal-50 lg:flex lg:w-[45%]">
      {/* subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 font-serif text-lg font-bold text-teal-950">
            W
          </div>
          <span className="text-lg font-semibold tracking-tight">WelfAI</span>
        </div>

        <h1 className="mt-16 font-serif text-4xl font-medium leading-[1.15] text-white">
          Fairer welfare decisions, backed by data.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-teal-200">
          WelfAI evaluates applicants using socioeconomic and geographic
          factors to score eligibility, flag inconsistencies, and recommend
          real income opportunities &mdash; not just a form to fill in.
        </p>
      </div>

      <div className="relative grid grid-cols-3 gap-6 border-t border-teal-800 pt-8">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-serif text-2xl text-amber-400">{s.value}</div>
            <div className="mt-1 text-xs leading-snug text-teal-300">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthBrandPanel;
