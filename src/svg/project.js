// 프로젝트를 "미션 카드"로 그립니다. 카드마다 다른 색의 행성이 오른쪽 위에 걸쳐 있습니다.
import { COLOR, FONT_MONO, FONT_SANS, TWINKLE_STYLE, esc, num, starfield, svgDocument, textBox, textWidth, wrap } from "./core.js";
import { textPath } from "./font.js";

const W = 490;
const H = 252;
const CARD = { x: 8, y: 8, w: W - 16, h: H - 16, r: 16 };
const LEFT = CARD.x + 24;

const PLANETS = [
  ["#c7d2fe", "#6366f1", "#1e1b4b"],
  ["#bae6fd", "#38bdf8", "#0c4a6e"],
  ["#f5d0fe", "#d946ef", "#581c87"],
  ["#a7f3d0", "#10b981", "#064e3b"],
  ["#fecdd3", "#fb7185", "#881337"],
  ["#fed7aa", "#f97316", "#7c2d12"],
  ["#e9d5ff", "#a855f7", "#3b0764"],
];

export function renderProject(project, missionNumber) {
  const award = Boolean(project.award);
  const [light, mid, dark] = PLANETS[(missionNumber - 1) % PLANETS.length];
  const mission = textPath(`MISSION ${String(missionNumber).padStart(2, "0")}`, {
    x: LEFT,
    y: 50,
    size: 12.5,
    weight: "medium",
    letterSpacing: 0.3,
  });
  const name = textPath(project.name.toUpperCase(), { x: LEFT, y: 92, size: 26, weight: "bold", letterSpacing: 0.04 });
  const link = textPath("GITHUB", { x: CARD.x + CARD.w - 40, y: 228, size: 11, weight: "medium", letterSpacing: 0.25, anchor: "end" });
  const descTop = award ? 154 : 128;
  const lines = wrap(project.description, 16, CARD.w - 48, award ? 3 : 4);
  const period = project.period.join(" — ");

  const defs = `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1226"/><stop offset="1" stop-color="#140c2e"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">${
      award
        ? `<stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#f59e0b" stop-opacity=".55"/><stop offset="1" stop-color="#fcd34d"/>`
        : `<stop offset="0" stop-color="${COLOR.cyan}" stop-opacity=".7"/><stop offset=".5" stop-color="#334166"/><stop offset="1" stop-color="${COLOR.violet}" stop-opacity=".7"/>`
    }</linearGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="${award ? "#fde68a" : "#c7d2fe"}"/></linearGradient>
    <radialGradient id="planet" cx=".3" cy=".7" r=".9"><stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <radialGradient id="glow"><stop offset=".62" stop-color="${mid}" stop-opacity="0"/><stop offset=".7" stop-color="${mid}" stop-opacity=".35"/><stop offset="1" stop-color="${mid}" stop-opacity="0"/></radialGradient>
    <clipPath id="card"><rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}"/></clipPath>
  `;
  const textZones = [
    textBox(mission.x, 50, mission.width, 12.5),
    textBox(name.x, 92, name.width, 26),
    ...(award ? [textBox(LEFT, 124, textWidth(`🏆 ${project.award}`, 15.5, { bold: true }), 15.5)] : []),
    ...lines.map((line, i) => textBox(LEFT, descTop + i * 24, textWidth(line, 16), 16)),
    [LEFT, CARD.y + CARD.h - 50, CARD.w - 48, 34],
  ];
  const px = CARD.x + CARD.w - 22;
  const py = CARD.y + 26;
  const body = `
  <g clip-path="url(#card)">
    <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" fill="url(#bg)"/>
    ${starfield({ x: CARD.x, y: CARD.y, width: CARD.w, height: CARD.h, count: 44, seed: `project-${project.name}`, maxRadius: 1.1, minOpacity: 0.25, avoid: textZones })}
    <circle cx="${px}" cy="${py}" r="92" fill="url(#glow)"/>
    <circle cx="${px}" cy="${py}" r="62" fill="url(#planet)"/>
    <ellipse cx="${px}" cy="${py}" rx="104" ry="20" transform="rotate(-24 ${px} ${py})" stroke="${light}" stroke-opacity=".5" stroke-width="3"/>
  </g>
  <rect x="${CARD.x + 0.75}" y="${CARD.y + 0.75}" width="${CARD.w - 1.5}" height="${CARD.h - 1.5}" rx="${CARD.r}" stroke="url(#edge)" stroke-width="1.5"/>
  <path d="${mission.d}" fill="${award ? COLOR.gold : COLOR.cyan}"/>
  <path d="${name.d}" fill="url(#name)"/>
  ${award ? `<text x="${LEFT}" y="124" font-family="${esc(FONT_SANS)}" font-size="15.5" font-weight="700" fill="${COLOR.gold}">${esc(`🏆 ${project.award}`)}</text>` : ""}
  ${lines.map((line, i) => `<text x="${LEFT}" y="${descTop + i * 24}" font-family="${esc(FONT_SANS)}" font-size="16" fill="#c3cbe0">${esc(line)}</text>`).join("\n  ")}
  <rect x="${LEFT}" y="${CARD.y + CARD.h - 46}" width="${CARD.w - 48}" height="1" fill="#24304f"/>
  <text x="${LEFT}" y="228" font-family="${esc(FONT_MONO)}" font-size="13" fill="#8b9bc7">${esc(period)}</text>
  <path d="${link.d}" fill="#93c5fd"/>
  <path d="M${num(link.x + link.width + 10)} 225L${num(link.x + link.width + 18)} 217M${num(link.x + link.width + 12)} 217H${num(link.x + link.width + 18)}V223" stroke="#93c5fd" stroke-width="1.6" stroke-linecap="round"/>`;

  return svgDocument({
    width: W,
    height: H,
    title: `${project.name} (${period})${award ? ` ${project.award}` : ""}: ${project.description}`,
    style: TWINKLE_STYLE,
    defs,
    body,
  });
}
