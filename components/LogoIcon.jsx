"use client";

import { LOGO_PATHS, LOGO_VIEWBOX } from "@/lib/logo-paths";

// Инлайновый SVG-логотип: все пути используют currentColor,
// поэтому перекрашивается через CSS-свойство color (text-primary и т.д.).
// viewBox "0 0 64 64" как в исходнике — логотип всегда в сетке оригинала.
const LogoIcon = ({ className = "" }) => (
  <svg
    viewBox={LOGO_VIEWBOX}
    className={className}
    aria-hidden="true"
    preserveAspectRatio="xMidYMid meet"
  >
    {LOGO_PATHS.map((p, i) => (
      <path key={i} fillRule={p.fillRule} transform={p.transform} fill="currentColor" d={p.d} />
    ))}
  </svg>
);

export default LogoIcon;