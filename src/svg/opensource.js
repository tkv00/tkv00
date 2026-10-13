// 오픈소스 기여 카드: GitHub PR 카드 모양에 머지 상태를 표시합니다.
import { COLOR, FONT_MONO, FONT_SANS, TWINKLE_STYLE, esc, sparkle, starfield, svgDocument, truncate } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const H = 156;

export function renderOpenSource(contribution) {
  const merged = contribution.status === "MERGED";
  const accent = merged ? COLOR.merged : COLOR.cyan;
  const pillW = 128;
  const pillX = W - 44 - pillW;
  const status = textPath(contribution.status, { x: pillX + pillW / 2, y: 70, size: 12.5, weight: "bold", letterSpacing: 0.25, anchor: "middle" });
  const textMax = pillX - 124 - 28;

  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1022"/><stop offset=".6" stop-color="#110c2c"/><stop offset="1" stop-color="#1a0d3a"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${accent}" stop-opacity=".85"/><stop offset=".5" stop-color="#2a3a66"/><stop offset="1" stop-color="${accent}" stop-opacity=".6"/></linearGradient>
    <radialGradient id="neb"><stop offset="0" stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  `;
  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W - 120}" cy="40" rx="300" ry="160" fill="url(#neb)"/>
    ${starfield({ width: W, height: H, count: 70, seed: `oss-${contribution.number}`, maxRadius: 1.1, avoid: [[30, 36, 84, 84], [118, 38, textMax + 16, 92], [pillX - 6, 42, pillW + 12, 74]] })}
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="16" stroke="url(#edge)" stroke-width="1.5"/>
  <circle cx="72" cy="78" r="32" fill="${accent}" fill-opacity=".14" stroke="${accent}" stroke-opacity=".7" stroke-width="1.5"/>
  <g stroke="${accent}" stroke-width="2.6" stroke-linecap="round" fill="none">
    <circle cx="63" cy="64" r="4.5"/><circle cx="63" cy="92" r="4.5"/><circle cx="83" cy="80" r="4.5"/>
    <path d="M63 68.5V87.5M63 68.5Q63 80 78.5 80"/>
  </g>
  <text x="124" y="62" font-family="${esc(FONT_SANS)}" font-size="21" font-weight="700" fill="${COLOR.text}">${esc(contribution.repo)}<tspan dx="10" font-weight="400" fill="${COLOR.muted}">#${contribution.number}</tspan></text>
  <text x="124" y="93" font-family="${esc(FONT_MONO)}" font-size="15" fill="#c9d1d9">${esc(truncate(contribution.title, 15, textMax))}</text>
  <text x="124" y="122" font-family="${esc(FONT_SANS)}" font-size="15.5" fill="${COLOR.sub}">${esc(truncate(contribution.description, 15.5, textMax))}</text>
  <rect x="${pillX}" y="48" width="${pillW}" height="32" rx="16" fill="${merged ? "#8957e5" : "#1f6feb"}"/>
  <path d="${status.d}" fill="#ffffff"/>
  <text x="${pillX + pillW / 2}" y="108" text-anchor="middle" font-family="${esc(FONT_MONO)}" font-size="14" fill="${COLOR.muted}">${esc(contribution.date)}</text>
  ${sparkle(pillX - 18, 40, 6, "#e9d5ff", "tw1")}`;
  return svgDocument({
    width: W,
    height: H,
    title: `${contribution.repo} PR #${contribution.number} (${contribution.status}): ${contribution.title} | ${contribution.description}`,
    style: TWINKLE_STYLE,
    defs,
    body,
  });
}
