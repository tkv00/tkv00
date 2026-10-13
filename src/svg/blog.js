// 최근 블로그 글 카드입니다. 글마다 따로 링크를 걸 수 있도록 머리, 글 줄, 꼬리를 각각 이미지로 만들고
// README에서 틈 없이 이어 붙입니다. 모든 조각의 폭이 같아서 화면 폭이 바뀌어도 한 장의 카드처럼 보입니다.
import { FONT_SANS, TWINKLE_STYLE, esc, num, roundedBottomRect, roundedTopRect, starfield, svgDocument, textBox, textWidth, truncate } from "./core.js";
import { textPath } from "./font.js";

const W = 1000;
const PAD = 34;
const RADIUS = 16;
const CARD = {
  bg: "#0d1426",
  border: "#2b3655",
  divider: "#2f3b5c",
  accent: "#58a6ff",
  title: "#c9d1d9",
  date: "#8b949e",
};
const EDGE = 0.75;

const sides = (height) =>
  `<path d="M${EDGE} 0V${height}M${W - EDGE} 0V${height}" stroke="${CARD.border}" stroke-width="1.5"/>`;

export function renderBlogHeader() {
  const H = 88;
  const sync = textPath("RSS SYNC", { x: W - PAD, y: 50, size: 11, weight: "medium", letterSpacing: 0.25, anchor: "end" });
  const body = `
  <path d="${roundedTopRect(0, 0, W, H, RADIUS)}" fill="${CARD.bg}"/>
  ${starfield({ x: 8, y: 8, width: W - 16, height: H - 24, count: 30, seed: "blog-header", maxRadius: 1, minOpacity: 0.2, avoid: [textBox(PAD, 54, textWidth("📝 최근 블로그 글", 24, { bold: true }), 24), textBox(sync.x - 22, 50, sync.width + 22, 11)] })}
  <path d="M${EDGE} ${H}V${RADIUS}Q${EDGE} ${EDGE} ${RADIUS} ${EDGE}H${W - RADIUS}Q${W - EDGE} ${EDGE} ${W - EDGE} ${RADIUS}V${H}" stroke="${CARD.border}" stroke-width="1.5"/>
  <text x="${PAD}" y="54" font-family="${esc(FONT_SANS)}" font-size="24" font-weight="700" fill="${CARD.accent}">📝 최근 블로그 글</text>
  <circle class="pulse" cx="${num(sync.x - 14)}" cy="45.5" r="3.5" fill="#34d399"/>
  <path d="${sync.d}" fill="#7a88ad"/>
  <rect x="${PAD}" y="${H - 9}" width="${W - PAD * 2}" height="1.5" fill="${CARD.divider}"/>`;
  const style = `${TWINKLE_STYLE}.pulse{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}`;
  return svgDocument({ width: W, height: H, title: "최근 블로그 글", style, body });
}

export function renderBlogRow(post, index) {
  const H = 58;
  const dateSize = 16;
  const titleSize = 18;
  const titleX = PAD + 32;
  const dateWidth = textWidth(post.date, dateSize);
  const title = truncate(post.title, titleSize, W - PAD - titleX - dateWidth - 36);
  const body = `
  <rect width="${W}" height="${H}" fill="${CARD.bg}"/>
  ${starfield({ x: 8, y: 6, width: W - 16, height: H - 12, count: 12, seed: `blog-row-${index}`, maxRadius: 0.9, minOpacity: 0.15, avoid: [[PAD, 14, W - PAD * 2, 30]] })}
  ${sides(H)}
  <path d="M${PAD + 4} 22L${PAD + 15} 29L${PAD + 4} 36Z" stroke="${CARD.accent}" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="${titleX}" y="35" font-family="${esc(FONT_SANS)}" font-size="${titleSize}" fill="${CARD.title}">${esc(title)}</text>
  <text x="${W - PAD}" y="35" text-anchor="end" font-family="${esc(FONT_SANS)}" font-size="${dateSize}" fill="${CARD.date}" style="font-variant-numeric:tabular-nums">${esc(post.date)}</text>`;
  return svgDocument({ width: W, height: H, title: `${post.title} (${post.date})`, style: TWINKLE_STYLE, body });
}

export function renderBlogFooter(blog) {
  const H = 60;
  const body = `
  <path d="${roundedBottomRect(0, 0, W, H, RADIUS)}" fill="${CARD.bg}"/>
  <path d="M${EDGE} 0V${H - RADIUS}Q${EDGE} ${H - EDGE} ${RADIUS} ${H - EDGE}H${W - RADIUS}Q${W - EDGE} ${H - EDGE} ${W - EDGE} ${H - RADIUS}V0" stroke="${CARD.border}" stroke-width="1.5"/>
  <text x="${PAD}" y="34" font-family="${esc(FONT_SANS)}" font-size="14.5" fill="#6e7c9f">${esc(`${blog.name} | ${blog.tagline}`)}</text>
  <text x="${W - PAD}" y="34" text-anchor="end" font-family="${esc(FONT_SANS)}" font-size="15" font-weight="600" fill="${CARD.accent}">전체 글 보기 →</text>`;
  return svgDocument({ width: W, height: H, title: `${blog.name} 블로그 전체 글 보기`, body });
}
