"use client";

const STEPS = [
  { key: "new", label: "Принят" },
  { key: "cooking", label: "Готовится" },
  { key: "ready", label: "Готов к выдаче" },
  { key: "done", label: "Выдан" },
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function OrderStatusTracker({ status, canceledBy }) {
  if (status === "canceled") return null;

  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));

  return (
    <div className="mt-2 bg-white rounded-3xl border border-black/10 shadow-card p-6">
      <ol className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li key={step.key} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <span
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${done ? "bg-primary" : "bg-cream"}`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
                  done
                    ? "bg-primary text-white"
                    : current
                    ? "bg-primary text-white ring-4 ring-green-500/40 animate-[softPulse_1.6s_ease-in-out_infinite]"
                    : "bg-cream text-subtle"
                }`}
              >
                {done ? <Check /> : i + 1}
              </span>
              <span
                className={`mt-2 text-[11px] font-bold text-center leading-tight ${
                  current ? "text-primary-dark" : done ? "text-ink" : "text-subtle"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-xs text-subtle">Статус обновляется автоматически</p>
      {status === "ready" && (
        <p className="mt-2 text-center font-extrabold text-primary-dark">
          Готово — подходите к точке выдачи!
        </p>
      )}
    </div>
  );
}
