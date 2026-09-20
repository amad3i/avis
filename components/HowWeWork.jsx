import React from "react";
import Icon from "./icons";
import { siteConfig } from "@/lib/site.config";

const HowWeWork = () => {
  const L = siteConfig.t.howWeWork;
  return (
  <section className="mt-16 md:mt-24">
    <div className="text-center mb-10">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-primary flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        {L.eyebrow}
      </p>
      <h2 className="h2 text-ink mt-2">{L.title}</h2>
    </div>

    <div className="grid md:grid-cols-3 gap-5 md:gap-7">
      {L.steps.map((st, i) => (
        <div
          key={st.title}
          className="neu-card rounded-[28px] p-6 md:p-8 relative overflow-hidden"
        >
          <div className="flex items-start justify-between -mt-1">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white neu-inset-sm flex items-center justify-center">
              <Icon name={st.icon} className="w-6 h-6" />
            </div>
            <span className="text-[56px] leading-none font-extrabold text-primary/25 select-none">
              0{i + 1}
            </span>
          </div>
          <p className="font-extrabold text-lg text-primary mt-5">{st.title}</p>
          <p className="text-sm text-subtle leading-6 mt-2">{st.text}</p>
        </div>
      ))}
    </div>
  </section>
  );
};

export default HowWeWork;
