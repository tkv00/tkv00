// 섹션 제목 띠: 궤도 아이콘, Orbitron 제목, 한글 부제, 스캔 라인으로 구성됩니다.
import { COLOR, FONT_SANS, TWINKLE_STYLE, esc, num, starfield, svgDocument, textBox, textWidth } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const H = 76;

export function renderSection({ index, total, title, subtitle }) {
  const heading = textPath(title, { x: 92, y: 48, size: 25, weight: "bold", letterSpacing: 0.12 });
  const subX = heading.x + heading.width + 18;
  const subWidth = textWidth(subtitle, 16);
  const counter = textPath(`${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: W - 34,
    y: 44,
    size: 12,
    weight: "medium",
    letterSpacing: 0.2,
    anchor: "end",
  });
  const lineStart = num(subX + subWidth + 22);
  const lineEnd = num(counter.x - 22);

  const style = `
    ${TWINKLE_STYLE}
    .scan{animation:scan 5.5s ease-in-out infinite}
    @keyframes scan{0%{transform:translateX(0);opacity:0}10%{opacity:1}80%{opacity:1}100%{transform:translateX(${num(lineEnd - lineStart)}px);opacity:0}}
  `;
  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b1130"/><stop offset=".6" stop-color="#0a0f26"/><stop offset="1" stop-color="#160b33"/></linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#a5b4fc"/></linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLOR.cyan}" stop-opacity=".6"/><stop offset="1" stop-color="${COLOR.violet}" stop-opacity=".08"/></linearGradient>
    <radialGradient id="planet" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".55" stop-color="#60a5fa"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient>
    <clipPath id="frame"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14"/></clipPath>
  `;
  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${starfield({ width: W, height: H, count: 52, seed: `section-${title}`, maxRadius: 1.1, avoid: [[24, 14, 56, 48], textBox(heading.x, 48, heading.width, 25), textBox(subX, 46, subWidth, 16), textBox(counter.x, 44, counter.width, 12)] })}
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" stroke="#2a3a66" stroke-width="1.5"/>
  <g transform="translate(52 38)">
    <circle r="10" fill="url(#planet)"/>
    <g transform="rotate(-20)">
      <ellipse rx="22" ry="8" stroke="${COLOR.cyan}" stroke-opacity=".45"/>
      <circle r="2.6" fill="${COLOR.pink}"><animateMotion dur="4s" repeatCount="indefinite" path="M22 0A22 8 0 1 1 -22 0A22 8 0 1 1 22 0"/></circle>
    </g>
  </g>
  <path d="${heading.d}" fill="url(#title)"/>
  <text x="${num(subX)}" y="46" font-family="${esc(FONT_SANS)}" font-size="16" fill="${COLOR.sub}">${esc(subtitle)}</text>
  ${lineEnd - lineStart > 40 ? `<rect x="${lineStart}" y="37" width="${num(lineEnd - lineStart)}" height="1.5" fill="url(#rule)"/><circle class="scan" cx="${lineStart}" cy="37.75" r="2.4" fill="${COLOR.cyan}"/>` : ""}
  <path d="${counter.d}" fill="${COLOR.muted}"/>`;

  return svgDocument({ width: W, height: H, title: `${title} ${subtitle}`, style, defs, body });
}
