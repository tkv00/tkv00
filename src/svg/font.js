// Orbitron 글꼴을 SVG path로 바꿉니다.
// README 이미지 안에서는 웹폰트를 불러올 수 없어서, 제목류는 글꼴 대신 벡터 경로로 그립니다.
import { readFileSync } from "fs";
import opentype from "opentype.js";
import { num } from "./core.js";

const FILES = {
  medium: "Orbitron-Medium.ttf",
  bold: "Orbitron-Bold.ttf",
  black: "Orbitron-Black.ttf",
};

const cache = new Map();

function load(weight) {
  if (!cache.has(weight)) {
    const buffer = readFileSync(new URL(`../fonts/${FILES[weight]}`, import.meta.url));
    cache.set(weight, opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)));
  }
  return cache.get(weight);
}

// letterSpacing은 em 단위입니다. 반환값의 width는 마지막 글자 뒤 자간을 뺀 실제 너비입니다.
export function measure(text, { size, weight = "bold", letterSpacing = 0 }) {
  const font = load(weight);
  const width = font.getAdvanceWidth(text, size, { letterSpacing });
  return Math.max(0, width - letterSpacing * size);
}

// opentype.js 2.0.0의 toPathData()는 일부 좌표를 NaN으로 출력하는 버그가 있어 직접 직렬화합니다.
function toPathData(commands, precision) {
  const n = (value) => num(value, precision);
  return commands
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return "Z";
    })
    .join("");
}

export function textPath(text, { x, y, size, weight = "bold", letterSpacing = 0, anchor = "start", precision = 1 }) {
  const width = measure(text, { size, weight, letterSpacing });
  const startX = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const path = load(weight).getPath(text, num(startX, 2), y, size, { letterSpacing });
  return { d: toPathData(path.commands, precision), width, x: startX };
}

// 글자마다 누적 너비를 돌려줍니다. 콘솔 타이핑 애니메이션이 글자 단위로 끊어 보이게 할 때 씁니다.
export function prefixWidths(text, { size, weight = "medium", letterSpacing = 0 }) {
  const chars = [...text];
  return chars.map((_, index) => measure(chars.slice(0, index + 1).join(""), { size, weight, letterSpacing }));
}
