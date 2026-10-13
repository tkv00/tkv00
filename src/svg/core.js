// SVG 생성에 공통으로 쓰는 색상, 글꼴, 난수, 별 배경, 텍스트 측정 도구입니다.

export const COLOR = {
  bgTop: "#060815",
  bgMid: "#0a1030",
  bgBottom: "#170b36",
  text: "#e6edf3",
  sub: "#aab6d3",
  muted: "#7a88ad",
  cyan: "#67e8f9",
  violet: "#a78bfa",
  pink: "#f472b6",
  gold: "#fcd34d",
  merged: "#a371f7",
};

export const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'";
export const FONT_MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

// 소수점 자리를 고정해 같은 입력이면 항상 같은 파일이 나오게 합니다.
export const num = (value, digits = 1) => {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
};

export const esc = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

export function hashSeed(text) {
  let hash = 2166136261;
  for (const ch of text) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32: seed가 같으면 별 위치가 매번 같아서 자동 갱신 때 불필요한 diff가 생기지 않습니다.
export function random(seed) {
  let state = typeof seed === "string" ? hashSeed(seed) : seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function svgDocument({ width, height, title, style = "", defs = "", body }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${esc(title)}">`,
    `<title>${esc(title)}</title>`,
    style ? `<style>${style.replace(/\s*\n\s*/g, "")}</style>` : "",
    defs ? `<defs>${defs}</defs>` : "",
    body,
    "</svg>",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

// 반짝이는 별 그룹 3개를 공통 애니메이션으로 씁니다. 그룹 단위로 투명도만 바꿔 가볍게 유지합니다.
export const TWINKLE_STYLE = `
  .tw1{animation:tw 3.4s ease-in-out infinite}
  .tw2{animation:tw 5.2s ease-in-out infinite 1.3s}
  .tw3{animation:tw 7.6s ease-in-out infinite 2.6s}
  @keyframes tw{0%,100%{opacity:1}50%{opacity:.2}}
`;

const STAR_TINTS = ["#ffffff", "#ffffff", "#ffffff", "#cfe3ff", "#e9d5ff", "#a5f3fc"];

// avoid는 [x, y, width, height] 목록입니다. 별이 글자 위에 찍혀 마침표처럼 보이지 않도록 글자 영역을 비웁니다.
export function starfield({ x = 0, y = 0, width, height, count, seed, maxRadius = 1.4, minOpacity = 0.35, avoid = [] }) {
  const rand = random(seed);
  const groups = { static: [], tw1: [], tw2: [], tw3: [] };
  const keys = Object.keys(groups);
  const blocked = (px, py) => avoid.some(([ax, ay, aw, ah]) => px >= ax - 3 && px <= ax + aw + 3 && py >= ay - 3 && py <= ay + ah + 3);
  for (let i = 0; i < count; i += 1) {
    const cx = num(x + rand() * width);
    const cy = num(y + rand() * height);
    const r = num(0.35 + rand() ** 2.2 * maxRadius, 2);
    const fill = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
    const opacity = num(minOpacity + rand() * (1 - minOpacity), 2);
    const key = keys[Math.floor(rand() * keys.length)];
    if (blocked(cx, cy)) continue;
    groups[key].push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`);
  }
  return keys
    .filter((key) => groups[key].length)
    .map((key) => `<g${key === "static" ? "" : ` class="${key}"`}>${groups[key].join("")}</g>`)
    .join("\n");
}

// 십자 빛이 퍼지는 밝은 별입니다.
export function sparkle(cx, cy, size, color = "#ffffff", className = "tw2") {
  const s = size;
  const w = num(s * 0.16, 2);
  return `<g class="${className}" transform="translate(${num(cx)} ${num(cy)})"><path d="M0 ${-s}Q${w} ${-w} ${s} 0Q${w} ${w} 0 ${s}Q${-w} ${w} ${-s} 0Q${-w} ${-w} 0 ${-s}Z" fill="${color}"/><circle r="${num(s * 0.22, 2)}" fill="#ffffff"/></g>`;
}

// 시스템 글꼴의 너비를 보수적으로 추정합니다. 한글은 1em, 이모지는 1.25em으로 계산합니다.
export function textWidth(text, size, { bold = false } = {}) {
  let em = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === 0xfe0f || cp === 0x200d) continue;
    if ((cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0x3130 && cp <= 0x318f) || (cp >= 0x4e00 && cp <= 0x9fff)) em += 1;
    else if (cp >= 0x1f000 || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x2b00 && cp <= 0x2bff)) em += 1.25;
    else if (ch === " ") em += 0.3;
    else if (/[A-Z]/.test(ch)) em += /[IJ]/.test(ch) ? 0.36 : /[MW]/.test(ch) ? 0.86 : 0.68;
    else if (/[a-z]/.test(ch)) em += /[ijlft]/.test(ch) ? 0.32 : /[mw]/.test(ch) ? 0.86 : 0.56;
    else if (/[0-9]/.test(ch)) em += 0.6;
    else if (/[.,:;'"!|`]/.test(ch)) em += 0.3;
    else if (/[()[\]{}\-/]/.test(ch)) em += 0.38;
    else em += 0.65;
  }
  return em * size * (bold ? 1.06 : 1);
}

// 글자 영역 사각형입니다. 별을 피할 때 씁니다. baseline 기준이라 위로 0.85em, 아래로 0.25em을 잡습니다.
export function textBox(x, baseline, width, size, anchor = "start") {
  const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  return [left, baseline - size * 0.85, width, size * 1.1];
}

export function truncate(text, size, maxWidth, options) {
  if (textWidth(text, size, options) <= maxWidth) return text;
  const chars = [...text];
  while (chars.length && textWidth(`${chars.join("").trimEnd()}…`, size, options) > maxWidth) chars.pop();
  return `${chars.join("").trimEnd()}…`;
}

// 어절(띄어쓰기) 단위로 줄을 나누고, maxLines를 넘으면 마지막 줄을 말줄임합니다.
export function wrap(text, size, maxWidth, maxLines = Infinity, options) {
  const lines = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (textWidth(candidate, size, options) <= maxWidth || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = truncate(`${kept[maxLines - 1]} ${lines.slice(maxLines).join(" ")}`, size, maxWidth, options);
  return kept;
}

export const roundedTopRect = (x, y, w, h, r) =>
  `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;

export const roundedBottomRect = (x, y, w, h, r) =>
  `M${x} ${y}V${y + h - r}Q${x} ${y + h} ${x + r} ${y + h}H${x + w - r}Q${x + w} ${y + h} ${x + w} ${y + h - r}V${y}Z`;

// 패널 네 모서리에 그리는 HUD 괄호입니다.
export function hudCorners({ x, y, width, height, size = 14, color = COLOR.cyan, opacity = 0.55 }) {
  const r = x + width;
  const b = y + height;
  return `<path d="M${x} ${y + size}V${y}H${x + size}M${r - size} ${y}H${r}V${y + size}M${r} ${b - size}V${b}H${r - size}M${x + size} ${b}H${x}V${b - size}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"/>`;
}
