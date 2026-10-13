// 기술 스택을 우주선 계기판 모듈처럼 배치합니다.
// 모듈 폭은 아이콘 개수에 비례하고, 한 줄에 아이콘 9칸까지 채워 넣는 벤토 그리드로 쌓습니다.
import { COLOR, FONT_SANS, TWINKLE_STYLE, esc, hudCorners, num, starfield, svgDocument } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const PAD = 24;
const GAP = 16;
const ROW_UNITS = 9;
const MODULE_H = 132;
const ICON = 46;

// 아이콘 SVG 안의 id와 스타일이 서로 섞이지 않도록 각각 data URI 이미지로 감쌉니다.
const dataUri = (svg) =>
  `data:image/svg+xml,${svg
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/[%#<>{}|\\^`]|[^\x00-\x7f]/gu, (ch) => encodeURIComponent(ch))}`;

const units = (group) => Math.max(group.items.length, 2);

function packRows(skills) {
  const rows = [];
  for (const group of skills) {
    const row = rows.at(-1);
    if (row && row.reduce((sum, g) => sum + units(g), 0) + units(group) <= ROW_UNITS) row.push(group);
    else rows.push([group]);
  }
  return rows;
}

function renderModule(group, x, y, width, icons) {
  const label = textPath(group.category, { x: x + 20, y: y + 30, size: 12, weight: "medium", letterSpacing: 0.28 });
  const slot = Math.min(96, (width - 32) / group.items.length);
  const items = group.items
    .map(([icon, name], i) => {
      const cx = x + 16 + slot * i + slot / 2;
      return `<image x="${num(cx - ICON / 2)}" y="${y + 46}" width="${ICON}" height="${ICON}" href="${esc(dataUri(icons.get(icon)))}"/><text x="${num(cx)}" y="${y + 114}" text-anchor="middle" font-family="${esc(FONT_SANS)}" font-size="12" fill="${COLOR.sub}">${esc(name)}</text>`;
    })
    .join("");
  return `
  <g>
    <rect x="${num(x)}" y="${y}" width="${num(width)}" height="${MODULE_H}" rx="12" fill="#0b1229" fill-opacity=".62" stroke="#25345e"/>
    <circle cx="${num(x + width - 20)}" cy="${y + 25}" r="3" fill="${COLOR.cyan}" class="tw1"/>
    <path d="${label.d}" fill="${COLOR.cyan}"/>
    <rect x="${num(label.x + label.width + 12)}" y="${y + 25}" width="${num(Math.max(0, width - label.width - 70))}" height="1" fill="#25345e"/>
    ${items}
  </g>`;
}

export function renderStack(skills, icons) {
  const rows = packRows(skills);
  const H = PAD * 2 + rows.length * MODULE_H + (rows.length - 1) * GAP;
  const placed = rows.flatMap((row, r) => {
    const free = W - PAD * 2 - GAP * (row.length - 1);
    const total = row.reduce((sum, g) => sum + units(g), 0);
    let x = PAD;
    return row.map((group) => {
      const width = (free * units(group)) / total;
      const module = { group, x, y: PAD + r * (MODULE_H + GAP), width };
      x += width + GAP;
      return module;
    });
  });
  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070b1d"/><stop offset=".6" stop-color="#0a1030"/><stop offset="1" stop-color="#150b33"/></linearGradient>
    <radialGradient id="neb"><stop offset="0" stop-color="#7c3aed" stop-opacity=".3"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="neb2"><stop offset="0" stop-color="#0891b2" stop-opacity=".22"/><stop offset="1" stop-color="#0891b2" stop-opacity="0"/></radialGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  `;
  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W * 0.82}" cy="${num(H * 0.25)}" rx="340" ry="230" fill="url(#neb)"/>
    <ellipse cx="${W * 0.12}" cy="${num(H * 0.85)}" rx="300" ry="200" fill="url(#neb2)"/>
    ${starfield({ width: W, height: H, count: 160, seed: "stack", maxRadius: 1.2, avoid: placed.map((m) => [m.x, m.y, m.width, MODULE_H]) })}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="16" stroke="#2a3a66" stroke-width="1.5"/>
  ${hudCorners({ x: 8, y: 8, width: W - 16, height: H - 16, size: 12, opacity: 0.4 })}
  ${placed.map((m) => renderModule(m.group, m.x, m.y, m.width, icons)).join("")}`;
  const title = skills.map((group) => `${group.category}: ${group.items.map(([, name]) => name).join(", ")}`).join(" / ");
  return svgDocument({ width: W, height: H, title, style: TWINKLE_STYLE, defs, body });
}
