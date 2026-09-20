"use client";
import React from "react";
import Icon, { ICON_NAMES } from "../icons";

const IconPicker = ({ value, onChange }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">Иконка</label>
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          className={`aspect-square rounded-xl flex items-center justify-center border transition ${
            value === name
              ? "bg-primary border-primary text-white"
              : "bg-cream border-transparent text-subtle hover:border-primary/40 hover:text-primary"
          }`}
        >
          <Icon name={name} className="w-5 h-5" />
        </button>
      ))}
    </div>
  </div>
);

export default IconPicker;
