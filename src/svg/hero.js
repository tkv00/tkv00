// 상단 히어로 배너: 성운, 별, 고리 행성, 데이터 흐름 별자리, 콘솔 타이핑을 한 장에 담습니다.
import { COLOR, FONT_SANS, TWINKLE_STYLE, esc, hudCorners, num, sparkle, starfield, svgDocument, textBox, textWidth } from "./core.js";
import { measure, prefixWidths, textPath } from "./font.js";

const W = 1000;
const H = 360;
const PLANET = { cx: 798, cy: 176, r: 72, tilt: -16 };

// 콘솔 문구를 한 글자씩 치고 지우는 타임라인을 만듭니다. 줄마다 시간 구간이 겹치지 않습니다.
function consoleTimeline(lines, { size, letterSpacing, slot = 5.8, typeStep = 0.045, eraseStep = 0.018 }) {
  const total = slot * lines.length;
  const tracks = lines.map((line, index) => {
    const widths = prefixWidths(line, { size, weight: "medium", letterSpacing });
    const start = index * slot + 0.35;
    const eraseAt = (index + 1) * slot - 0.2 - widths.length * eraseStep;
    const events = [[0, 0]];
    widths.forEach((width, k) => events.push([start + k * typeStep, width]));
    for (let k = widths.length - 2; k >= -1; k -= 1) {
      events.push([eraseAt + (widths.length - 2 - k) * eraseStep, k >= 0 ? widths[k] : 0]);
    }
    return events;
  });
  return { total, tracks };
}

function discreteAnimate(attribute, events, total, map = (value) => value) {
  const keyTimes = events.map(([time]) => num(Math.min(time / total, 1), 4));
  const values = events.map(([, value]) => num(map(value), 1));
  return `<animate attributeName="${attribute}" dur="${total}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keyTimes.join(";")}" values="${values.join(";")}"/>`;
}

function planet() {
  const { cx, cy, r, tilt } = PLANET;
  const ring = (id) => `
    <g transform="rotate(${tilt} ${cx} ${cy})" clip-path="url(#${id})">
      <ellipse cx="${cx}" cy="${cy}" rx="150" ry="31" stroke="url(#ringGrad)" stroke-width="9" opacity=".9"/>
      <ellipse cx="${cx}" cy="${cy}" rx="134" ry="26" stroke="#c4b5fd" stroke-opacity=".35" stroke-width="2"/>
      <ellipse cx="${cx}" cy="${cy}" rx="166" ry="35" stroke="#67e8f9" stroke-opacity=".25" stroke-width="1.2"/>
      <circle r="7.5" fill="url(#moonGrad)"><animateMotion dur="14s" repeatCount="indefinite" path="M${cx + 180} ${cy}A180 48 0 1 1 ${cx - 180} ${cy}A180 48 0 1 1 ${cx + 180} ${cy}"/></circle>
    </g>`;
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="url(#atmo)"/>
    ${ring("ringBack")}
    <g clip-path="url(#planetClip)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#planetGrad)"/>
      <g transform="rotate(${tilt} ${cx} ${cy})" opacity=".55">
        <ellipse cx="${cx}" cy="${cy - 34}" rx="${r + 30}" ry="7" fill="#ddd6fe" opacity=".35"/>
        <ellipse cx="${cx}" cy="${cy - 12}" rx="${r + 30}" ry="5" fill="#4c1d95" opacity=".55"/>
        <ellipse cx="${cx}" cy="${cy + 10}" rx="${r + 30}" ry="9" fill="#c4b5fd" opacity=".28"/>
        <ellipse cx="${cx}" cy="${cy + 36}" rx="${r + 30}" ry="6" fill="#312e81" opacity=".6"/>
        <ellipse class="storm" cx="${cx - 10}" cy="${cy + 22}" rx="15" ry="6" fill="#f0abfc" opacity=".55"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#shade)"/>
    </g>
    ${ring("ringFront")}
  </g>`;
}

// 서버 구조를 별자리로 표현했습니다. 패킷이 선을 따라 흐릅니다.
function constellation() {
  const nodes = {
    api: [640, 64, "API"],
    batch: [742, 36, "BATCH"],
    db: [866, 50, "DB"],
    cache: [924, 98, "CACHE"],
    queue: [676, 318, "QUEUE"],
    worker: [906, 304, "WORKER"],
  };
  const edges = [
    ["api", "batch"],
    ["batch", "db"],
    ["db", "cache"],
    ["queue", "worker"],
  ];
  const lines = edges
    .map(([a, b]) => {
      const [x1, y1] = nodes[a];
      const [x2, y2] = nodes[b];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#93c5fd" stroke-opacity=".28" stroke-dasharray="3 5"/>`;
    })
    .join("");
  const packets = edges
    .map(([a, b], index) => {
      const [x1, y1] = nodes[a];
      const [x2, y2] = nodes[b];
      return `<circle r="2.2" fill="${index % 2 ? COLOR.pink : COLOR.cyan}"><animateMotion dur="${3.2 + index * 0.7}s" begin="${index * 0.9}s" repeatCount="indefinite" path="M${x1} ${y1}L${x2} ${y2}"/><animate attributeName="opacity" dur="${3.2 + index * 0.7}s" begin="${index * 0.9}s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.15;.85;1"/></circle>`;
    })
    .join("");
  const labels = Object.values(nodes)
    .map(([x, y, label], index) => {
      const text = textPath(label, { x: x + 9, y: y + (index % 2 ? 14 : -7), size: 8.5, weight: "medium", letterSpacing: 0.22 });
      return `<circle cx="${x}" cy="${y}" r="2.6" fill="#e0f2fe"/><circle cx="${x}" cy="${y}" r="6" fill="#67e8f9" opacity=".18"/><path d="${text.d}" fill="#93c5fd" fill-opacity=".62"/>`;
    })
    .join("");
  return `<g>${lines}${packets}${labels}</g>`;
}

function shootingStars() {
  const starts = [
    [520, 26, "s1"],
    [930, 40, "s2"],
    [360, 70, "s3"],
  ];
  return starts
    .map(
      ([x, y, cls]) =>
        `<g transform="translate(${x} ${y})"><g class="shoot ${cls}"><line x1="0" y1="0" x2="90" y2="-45" stroke="url(#tail)" stroke-width="1.6" stroke-linecap="round"/><circle r="1.8" fill="#ffffff"/></g></g>`,
    )
    .join("");
}

export function renderHero(profile) {
  const title = textPath(profile.name.en, { x: 64, y: 150, size: 66, weight: "black", letterSpacing: 0.04 });
  const label = textPath("// MISSION CONTROL  /  TKV00", { x: 66, y: 76, size: 11.5, weight: "medium", letterSpacing: 0.3 });
  const role = textPath(profile.role, { x: 66, y: 190, size: 17, weight: "medium", letterSpacing: 0.42 });

  const consoleSize = 13;
  const consoleSpacing = 0.08;
  const consoleWidth = Math.max(...profile.consoleLines.map((line) => measure(line, { size: consoleSize, weight: "medium", letterSpacing: consoleSpacing })));
  const box = { x: 64, y: 250, w: Math.ceil(consoleWidth + 76), h: 40 };
  const textX = box.x + 38;
  const baseline = box.y + 25;
  const { total, tracks } = consoleTimeline(profile.consoleLines, { size: consoleSize, letterSpacing: consoleSpacing });

  // 별이 글자에 겹치지 않도록 제목, 부제, 한 줄 소개, 콘솔 영역을 비워 둡니다.
  const textZones = [
    textBox(label.x, 76, label.width, 11.5),
    textBox(title.x, 150, title.width, 66),
    textBox(role.x, 190, role.width + 136, 17),
    textBox(65, 229, textWidth(profile.tagline, 19), 19),
    [box.x, box.y, box.w, box.h],
  ];

  const clipDefs = tracks
    .map((events, index) => `<clipPath id="type${index}"><rect x="${textX}" y="${box.y + 4}" height="${box.h - 8}" width="0">${discreteAnimate("width", events, total)}</rect></clipPath>`)
    .join("");
  const consoleLines = profile.consoleLines
    .map((line, index) => {
      const glyphs = textPath(line, { x: textX, y: baseline, size: consoleSize, weight: "medium", letterSpacing: consoleSpacing });
      return `<path d="${glyphs.d}" fill="#e2e8f0" clip-path="url(#type${index})"/>`;
    })
    .join("");
  // 커서는 현재 치고 있는 줄의 끝을 따라갑니다.
  const cursorEvents = tracks
    .flatMap((events) => events.slice(1))
    .sort((a, b) => a[0] - b[0]);
  const cursor = `<rect y="${box.y + 12}" width="7" height="16" rx="1" fill="${COLOR.cyan}" class="blink">${discreteAnimate("x", [[0, 0], ...cursorEvents], total, (width) => textX + width + 3)}</rect>`;

  const style = `
    ${TWINKLE_STYLE}
    .neb{animation:drift 16s ease-in-out infinite alternate}
    .neb2{animation-duration:22s;animation-direction:alternate-reverse}
    @keyframes drift{from{transform:translate(-14px,6px)}to{transform:translate(16px,-8px)}}
    .shoot{opacity:0;animation:shoot 8s ease-in infinite}
    .s2{animation-duration:11s;animation-delay:3.1s}
    .s3{animation-duration:13s;animation-delay:6.4s}
    @keyframes shoot{0%{opacity:0;transform:translate(0,0)}2%{opacity:1}11%{opacity:0;transform:translate(-300px,150px)}100%{opacity:0;transform:translate(-300px,150px)}}
    .sheen{animation:sheen 6.5s ease-in-out infinite}
    @keyframes sheen{0%{transform:translateX(-160px)}45%,100%{transform:translateX(620px)}}
    .storm{animation:storm 18s linear infinite}
    @keyframes storm{from{transform:translateX(-95px)}to{transform:translateX(95px)}}
    .blink{animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .pulse{animation:pulse 2.4s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:.35}50%{opacity:.9}}
  `;

  const defs = `
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <linearGradient id="bg" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${COLOR.bgTop}"/><stop offset=".55" stop-color="${COLOR.bgMid}"/><stop offset="1" stop-color="${COLOR.bgBottom}"/></linearGradient>
    <radialGradient id="nebViolet"><stop offset="0" stop-color="#7c3aed" stop-opacity=".55"/><stop offset=".5" stop-color="#6d28d9" stop-opacity=".16"/><stop offset="1" stop-color="#6d28d9" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebBlue"><stop offset="0" stop-color="#2563eb" stop-opacity=".42"/><stop offset=".55" stop-color="#1d4ed8" stop-opacity=".12"/><stop offset="1" stop-color="#1d4ed8" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebPink"><stop offset="0" stop-color="#db2777" stop-opacity=".3"/><stop offset=".6" stop-color="#be185d" stop-opacity=".08"/><stop offset="1" stop-color="#be185d" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebCyan"><stop offset="0" stop-color="#06b6d4" stop-opacity=".22"/><stop offset="1" stop-color="#06b6d4" stop-opacity="0"/></radialGradient>
    <radialGradient id="planetGrad" cx=".34" cy=".3" r=".85"><stop offset="0" stop-color="#ddd6fe"/><stop offset=".3" stop-color="#a78bfa"/><stop offset=".68" stop-color="#5b21b6"/><stop offset="1" stop-color="#1e0b4b"/></radialGradient>
    <radialGradient id="shade" cx=".28" cy=".24" r="1"><stop offset=".42" stop-color="#05010f" stop-opacity="0"/><stop offset=".95" stop-color="#05010f" stop-opacity=".88"/></radialGradient>
    <radialGradient id="atmo"><stop offset=".7" stop-color="#a78bfa" stop-opacity="0"/><stop offset=".76" stop-color="#a78bfa" stop-opacity=".45"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#67e8f9" stop-opacity=".2"/><stop offset=".5" stop-color="#e9d5ff" stop-opacity=".95"/><stop offset="1" stop-color="#f472b6" stop-opacity=".25"/></linearGradient>
    <radialGradient id="moonGrad" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f8fafc"/><stop offset=".6" stop-color="#94a3b8"/><stop offset="1" stop-color="#334155"/></radialGradient>
    <clipPath id="planetClip"><circle cx="${PLANET.cx}" cy="${PLANET.cy}" r="${PLANET.r}"/></clipPath>
    <clipPath id="ringBack"><rect x="${PLANET.cx - 260}" y="${PLANET.cy - 120}" width="520" height="120"/></clipPath>
    <clipPath id="ringFront"><rect x="${PLANET.cx - 260}" y="${PLANET.cy}" width="520" height="120"/></clipPath>
    <linearGradient id="tail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="90" y2="-45"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".5" stop-color="#a5b4fc"/><stop offset="1" stop-color="#f0abfc"/></linearGradient>
    <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".85"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <linearGradient id="roleLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93c5fd" stop-opacity=".7"/><stop offset="1" stop-color="#93c5fd" stop-opacity="0"/></linearGradient>
    <clipPath id="titleClip"><path d="${title.d}"/></clipPath>
    <filter id="glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
    ${clipDefs}
  `;

  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse class="neb" cx="770" cy="120" rx="340" ry="230" fill="url(#nebViolet)"/>
    <ellipse class="neb neb2" cx="170" cy="330" rx="380" ry="210" fill="url(#nebBlue)"/>
    <ellipse class="neb" cx="560" cy="372" rx="280" ry="120" fill="url(#nebPink)"/>
    <ellipse class="neb neb2" cx="420" cy="40" rx="220" ry="90" fill="url(#nebCyan)"/>
    ${starfield({ width: W, height: H, count: 170, seed: "hero", avoid: textZones })}
    ${sparkle(598, 48, 7, "#e0f2fe", "tw1")}
    ${sparkle(476, 318, 5.5, "#f5d0fe", "tw3")}
    ${sparkle(972, 238, 6, "#cffafe", "tw2")}
    ${sparkle(34, 210, 4.5, "#ffffff", "tw1")}
    ${shootingStars()}
    ${constellation()}
    ${planet()}
    <path d="${label.d}" fill="${COLOR.cyan}" fill-opacity=".85"/>
    <path d="${title.d}" fill="#8b5cf6" opacity=".75" filter="url(#glow)"/>
    <path d="${title.d}" fill="url(#titleGrad)"/>
    <g clip-path="url(#titleClip)"><rect class="sheen" x="0" y="80" width="140" height="90" fill="url(#sheenGrad)" opacity=".55"/></g>
    <path d="${role.d}" fill="#93c5fd"/>
    <rect x="${num(role.x + role.width + 16)}" y="183" width="120" height="1.5" fill="url(#roleLine)"/>
    <text x="65" y="229" font-family="${esc(FONT_SANS)}" font-size="19" font-weight="500" fill="#cbd5e1">${esc(profile.tagline)}</text>
    <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="9" fill="#070b1c" fill-opacity=".78" stroke="#2c3d6b"/>
    <circle cx="${box.x + 18}" cy="${box.y + box.h / 2}" r="3.5" fill="#34d399" class="pulse"/>
    ${consoleLines}
    ${cursor}
    ${hudCorners({ x: 14, y: 14, width: W - 28, height: H - 28, size: 18 })}
  </g>`;

  return svgDocument({
    width: W,
    height: H,
    title: `${profile.name.ko} (${profile.name.en}) | ${profile.role} | ${profile.tagline}`,
    style,
    defs,
    body,
  });
}
