// Пути SVG-логотипа (зуб) — ЕДИНЫЙ источник истины.
//
// Используется и в <LogoIcon /> (перекрашивается через currentColor),
// и в генераторе фавикона (fill = акцентный цвет из конфига).
//
// viewBox="0 0 64 64", логотип рендерится в этой сетке где бы ни использовался.
// Форма: коронка моляра сверху и два расходящихся корня снизу.

export const LOGO_VIEWBOX = "0 0 64 64";

export const LOGO_PATHS = [
  {
    fillRule: "evenodd",
    transform: "",
    d: "M32 9C25.5 9 20 13.5 18.5 20C17.5 24 18 27.5 19.3 30.5C20.4 33 21 35.5 21 38.5C21 46 22.8 53 27.2 54.8C29 55.5 31 54.6 31.6 52.4C32 50.9 32 48.5 32 45.5C32 44.8 32.1 44.4 32.5 44.4C32.9 44.4 33 44.8 33 45.5C33 48.5 33 50.9 33.4 52.4C34 54.6 36 55.5 37.8 54.8C42.2 53 44 46 44 38.5C44 35.5 44.6 33 45.7 30.5C47 27.5 47.5 24 46.5 20C45 13.5 38.5 9 32 9Z",
  },
];

// Собирает <svg> фавикона: логотип как есть, без подложки, без растяжек.
//  - size        — сторона квадрата канваса
//  - figureFill  — цвет зуба ("" = currentColor для инлайновых мест)
//  - zoom        — увеличениe (1 = исходник "0 0 64 64"), >1 делает лого крупнее
export function circleLogoMarkup({
  size = 512,
  circleFill = "",
  figureFill = "#14B8A6",
  zoom = 1,
} = {}) {
  const paths = LOGO_PATHS.map(
    (p) => `<path fill-rule="${p.fillRule}"${p.transform ? ` transform="${p.transform}"` : ""} fill="${figureFill}" d="${p.d}"/>`
  ).join("");
  let vb = LOGO_VIEWBOX;
  if (zoom !== 1) {
    const [x, y, w, h] = LOGO_VIEWBOX.split(/\s+/).map(Number);
    const cw = w / zoom;
    const ch = h / zoom;
    vb = `${x + (w - cw) / 2} ${y + (h - ch) / 2} ${cw} ${ch}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">
  ${circleFill ? `<circle cx="${32}" cy="${32}" r="${32}" fill="${circleFill}"/>` : ""}
  ${paths}
</svg>`;
}

// Собирает <svg> для явного цвета без подложки ("как есть").
//  - color    — цвет логотипа
//  - bg       — цвет подложки ("" = прозрачная)
export function logoMarkup({
  color,
  bg = "",
  viewBox = LOGO_VIEWBOX,
  width = 512,
  height = 512,
  zoom = 1,
} = {}) {
  let vb = viewBox;
  if (zoom !== 1) {
    const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
    const cw = w / zoom;
    const ch = h / zoom;
    vb = `${x + (w - cw) / 2} ${y + (h - ch) / 2} ${cw} ${ch}`;
  }
  const body =
    (bg ? `<rect width="100%" height="100%" rx="22%" fill="${bg}"/>` : "") +
    LOGO_PATHS.map((p) => `<path fill-rule="${p.fillRule}"${p.transform ? ` transform="${p.transform}"` : ""} fill="${color}" d="${p.d}"/>`).join("");
  const pad = 'preserveAspectRatio="xMidYMid meet"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width}" height="${height}" ${pad}>${body}</svg>`;
}