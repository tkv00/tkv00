// 하단 배너: 행성 지평선 위로 로켓이 발사되는 장면입니다.
import { COLOR, TWINKLE_STYLE, num, sparkle, starfield, svgDocument } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const H = 210;

function rocket() {
  // 로켓 본체는 위쪽(-y)을 향하고, 불꽃은 아래에서 깜빡입니다.
  return `
  <g transform="translate(772 176)">
    <g class="launch">
      <path class="flame" d="M-5 10Q0 30 5 10Z" fill="#fbbf24"/>
      <path class="flame" d="M-3 10Q0 22 3 10Z" fill="#fff7ed"/>
      <path d="M0 -22C7 -14 8 -2 6 10H-6C-8 -2 -7 -14 0 -22Z" fill="#e2e8f0"/>
      <path d="M-6 2L-12 12L-6 10ZM6 2L12 12L6 10Z" fill="${COLOR.pink}"/>
      <circle cy="-6" r="3" fill="#38bdf8" stroke="#0f172a" stroke-width="1.2"/>
    </g>
  </g>`;
}

export function renderFooter(profile) {
  const title = textPath("THANKS FOR VISITING", { x: W / 2, y: 82, size: 26, weight: "bold", letterSpacing: 0.14, anchor: "middle" });
  const sub = textPath(`SEE YOU IN ORBIT  —  @${profile.github.toUpperCase()}`, { x: W / 2, y: 114, size: 11.5, weight: "medium", letterSpacing: 0.45, anchor: "middle" });
  const style = `
    ${TWINKLE_STYLE}
    .launch{animation:launch 7s ease-in infinite}
    @keyframes launch{0%{transform:translateY(0);opacity:0}6%{opacity:1}55%{transform:translateY(-190px);opacity:1}62%,100%{transform:translateY(-220px);opacity:0}}
    .flame{animation:flame .18s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:top}
    @keyframes flame{from{transform:scaleY(.7)}to{transform:scaleY(1.15)}}
  `;
  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060f"/><stop offset=".7" stop-color="#0d0f33"/><stop offset="1" stop-color="#2a1259"/></linearGradient>
    <radialGradient id="surface" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#3b1d7a"/><stop offset=".25" stop-color="#160b36"/><stop offset="1" stop-color="#05060f"/></radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLOR.cyan}" stop-opacity="0"/><stop offset=".3" stop-color="${COLOR.cyan}"/><stop offset=".7" stop-color="${COLOR.violet}"/><stop offset="1" stop-color="${COLOR.pink}" stop-opacity="0"/></linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5f3fc"/><stop offset=".5" stop-color="#e0e7ff"/><stop offset="1" stop-color="#f5d0fe"/></linearGradient>
    <filter id="haze" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  `;
  const horizon = `M-20 ${H}V${H - 26}Q${W / 2} ${H - 70} ${W + 20} ${H - 26}V${H}Z`;
  const rim = `M-20 ${H - 26}Q${W / 2} ${H - 70} ${W + 20} ${H - 26}`;
  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${starfield({ width: W, height: H - 40, count: 130, seed: "footer", maxRadius: 1.3, avoid: [[title.x, 56, title.width, 34], [sub.x, 100, sub.width, 20]] })}
    ${sparkle(184, 52, 6, "#e0f2fe", "tw1")}
    ${sparkle(866, 46, 5, "#f5d0fe", "tw3")}
    ${rocket()}
    <path d="${rim}" stroke="url(#rim)" stroke-width="10" opacity=".55" filter="url(#haze)"/>
    <path d="${horizon}" fill="url(#surface)"/>
    <path d="${rim}" stroke="url(#rim)" stroke-width="1.6"/>
  </g>
  <path d="${title.d}" fill="url(#title)"/>
  <path d="${sub.d}" fill="${COLOR.muted}"/>
  <rect x="${num(W / 2 - 60)}" y="96" width="120" height="1" fill="#33406b"/>`;
  return svgDocument({ width: W, height: H, title: "Thanks for visiting", style, defs, body });
}
