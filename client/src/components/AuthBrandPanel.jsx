const stats = [
  { value: '1.6M+', label: 'families assessed under Sri Lanka\u2019s poverty line' },
  { value: '25', label: 'districts covered by geographic scoring' },
  { value: 'AI', label: 'driven eligibility & fraud detection' },
];

const AuthBrandPanel = () => {
  return (
    <div className="relative hidden lg:flex lg:w-[45%] lg:sticky lg:top-0 lg:h-screen flex-col justify-between overflow-hidden bg-teal-950 px-8 xl:px-12 py-6 xl:py-9 text-teal-50">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400 font-serif text-base font-bold text-teal-950">
            W
          </div>
          <span className="text-base font-semibold tracking-tight">WelfAI</span>
        </div>

        <h1 className="mt-6 xl:mt-8 font-serif text-2xl xl:text-3xl font-medium leading-snug text-white">
          Fairer welfare decisions, backed by data.
        </h1>
      </div>

      <div className="relative mt-4 xl:mt-6 grid grid-cols-3 gap-3 xl:gap-5 border-t border-teal-800 pt-4 xl:pt-5">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-serif text-lg xl:text-xl text-amber-400">{s.value}</div>
            <div className="mt-0.5 text-[11px] xl:text-xs leading-snug text-teal-300">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthBrandPanel;
