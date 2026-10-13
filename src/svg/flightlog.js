// 활동 이력(궤도 타임라인)과 자격증(미션 패치)을 한 장의 비행 기록 패널로 그립니다.
import { COLOR, FONT_MONO, FONT_SANS, TWINKLE_STYLE, esc, hudCorners, num, starfield, svgDocument, truncate } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const H = 350;
const LINE_Y = 126;
const LINE = { from: 48, to: 952 };
const PATCH_TOP = 248;
const PATCH_COLORS = [COLOR.cyan, COLOR.violet, COLOR.pink, COLOR.gold];

function hexagon(cx, cy, r) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${num(cx + r * Math.cos(angle))},${num(cy + r * Math.sin(angle))}`;
  });
  return points.join(" ");
}

function timeline(activities) {
  const step = (LINE.to - LINE.from) / activities.length;
  const nodes = activities.map((activity, i) => ({ ...activity, x: num(LINE.from + step * (i + 0.5)) }));
  const last = nodes.at(-1);
  const items = nodes
    .map((node) => {
      // 끝난 날짜가 없는 활동은 진행 중이므로 분홍색으로 깜빡이게 합니다.
      const live = !node.period[1];
      const period = `${node.period[0]} — ${node.period[1] ?? "NOW"}`;
      const name = truncate(`${node.emoji} ${node.name}`, 17, step - 16, { bold: true });
      return `
      <text x="${node.x}" y="${LINE_Y - 44}" text-anchor="middle" font-family="${esc(FONT_SANS)}" font-size="17" font-weight="700" fill="${COLOR.text}">${esc(name)}</text>
      <text x="${node.x}" y="${LINE_Y - 21}" text-anchor="middle" font-family="${esc(FONT_SANS)}" font-size="14.5" fill="#9fb0d4">${esc(node.detail)}</text>
      ${live ? `<circle cx="${node.x}" cy="${LINE_Y}" r="8" stroke="${COLOR.pink}" stroke-width="1.5"><animate attributeName="r" values="8;24" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2.2s" repeatCount="indefinite"/></circle>` : ""}
      <circle cx="${node.x}" cy="${LINE_Y}" r="8.5" fill="#0b1226" stroke="${live ? COLOR.pink : COLOR.cyan}" stroke-width="2"/>
      <circle cx="${node.x}" cy="${LINE_Y}" r="3.5" fill="${live ? COLOR.pink : "#e0f2fe"}"/>
      <text x="${node.x}" y="${LINE_Y + 34}" text-anchor="middle" font-family="${esc(FONT_MONO)}" font-size="13.5" fill="${live ? "#f9a8d4" : "#8b9bc7"}">${esc(period)}</text>`;
    })
    .join("");
  return `
    <rect x="${LINE.from}" y="${LINE_Y - 1}" width="${num(last.x - LINE.from)}" height="2" fill="url(#orbit)"/>
    <path d="M${last.x} ${LINE_Y}H${LINE.to}" stroke="#f472b6" stroke-opacity=".45" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
    <circle r="4" fill="#ffffff" filter="url(#soft)"><animateMotion dur="5.5s" repeatCount="indefinite" path="M${LINE.from} ${LINE_Y}H${last.x}"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="5.5s" repeatCount="indefinite"/></circle>
    ${items}`;
}

function patches(certificates) {
  const gap = 16;
  const top = PATCH_TOP;
  const cellW = (W - 64 - gap * (certificates.length - 1)) / certificates.length;
  return certificates
    .map((cert, i) => {
      const x = 32 + i * (cellW + gap);
      const color = PATCH_COLORS[i % PATCH_COLORS.length];
      const cx = x + 36;
      const cy = top + 39;
      return `
      <rect x="${num(x)}" y="${top}" width="${num(cellW)}" height="78" rx="12" fill="#0b1229" fill-opacity=".75" stroke="#25345e"/>
      <polygon points="${hexagon(cx, cy, 21)}" fill="${color}" fill-opacity=".1" stroke="${color}" stroke-width="1.6"/>
      <path d="M${num(cx)} ${cy - 9}L${num(cx + 2.6)} ${cy - 2.6}L${num(cx + 9)} ${cy}L${num(cx + 2.6)} ${cy + 2.6}L${num(cx)} ${cy + 9}L${num(cx - 2.6)} ${cy + 2.6}L${num(cx - 9)} ${cy}L${num(cx - 2.6)} ${cy - 2.6}Z" fill="${color}"/>
      <text x="${num(x + 68)}" y="${top + 35}" font-family="${esc(FONT_SANS)}" font-size="17" font-weight="700" fill="${COLOR.text}">${esc(truncate(cert.name, 17, cellW - 78, { bold: true }))}</text>
      <text x="${num(x + 68)}" y="${top + 58}" font-family="${esc(FONT_SANS)}" font-size="13.5" fill="#9fb0d4">${esc(truncate(cert.detail, 13.5, cellW - 78))}</text>`;
    })
    .join("");
}

export function renderFlightLog(activities, certificates) {
  const activityLabel = textPath("ACTIVITY", { x: 32, y: 44, size: 12, weight: "medium", letterSpacing: 0.3 });
  const certLabel = textPath("CERTIFICATES", { x: 32, y: 228, size: 12, weight: "medium", letterSpacing: 0.3 });
  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070b1d"/><stop offset=".55" stop-color="#0a1030"/><stop offset="1" stop-color="#170b36"/></linearGradient>
    <linearGradient id="orbit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLOR.cyan}" stop-opacity=".25"/><stop offset=".6" stop-color="${COLOR.violet}"/><stop offset="1" stop-color="${COLOR.pink}"/></linearGradient>
    <radialGradient id="neb"><stop offset="0" stop-color="#2563eb" stop-opacity=".3"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2"/></filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  `;
  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="160" cy="300" rx="360" ry="200" fill="url(#neb)"/>
    ${starfield({ width: W, height: H, count: 120, seed: "flightlog", maxRadius: 1.2, avoid: [[24, 30, 120, 18], [LINE.from - 40, LINE_Y - 64, LINE.to - LINE.from + 80, 50], [LINE.from - 40, LINE_Y + 18, LINE.to - LINE.from + 80, 22], [24, 214, 160, 18], [24, PATCH_TOP, W - 48, 78]] })}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="16" stroke="#2a3a66" stroke-width="1.5"/>
  ${hudCorners({ x: 8, y: 8, width: W - 16, height: H - 16, size: 12, opacity: 0.4 })}
  <path d="${activityLabel.d}" fill="${COLOR.cyan}"/>
  ${timeline(activities)}
  <rect x="${num(certLabel.x + certLabel.width + 14)}" y="223" width="${num(W - 32 - certLabel.width - 46)}" height="1" fill="#25345e"/>
  <path d="${certLabel.d}" fill="${COLOR.cyan}"/>
  ${patches(certificates)}`;
  const title = [
    ...activities.map((a) => `${a.name} ${a.detail} (${a.period[0]} ~ ${a.period[1] ?? ""})`),
    ...certificates.map((c) => `${c.name} ${c.detail}`),
  ].join(" / ");
  return svgDocument({ width: W, height: H, title, style: TWINKLE_STYLE, defs, body });
}
