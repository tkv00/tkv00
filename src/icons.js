// 기술 스택 아이콘을 src/icons/에서 읽습니다. 처음 쓰는 아이콘이면 go-skill-icons에서 한 번만 내려받아 저장합니다.
// 패널이 항상 어두워서 GitHub 테마와 상관없이 다크 아이콘을 씁니다.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const DIR = new URL("./icons/", import.meta.url);
const SOURCE = "https://go-skill-icons.vercel.app/api/icons?theme=dark&i=";

export async function loadIcons(names) {
  mkdirSync(DIR, { recursive: true });
  const icons = new Map();
  for (const name of names) {
    const file = new URL(`${name}.svg`, DIR);
    if (!existsSync(file)) {
      const response = await fetch(`${SOURCE}${encodeURIComponent(name)}`);
      const svg = await response.text();
      if (!response.ok || !svg.includes("<svg")) throw new Error(`아이콘을 받지 못했습니다: ${name} (${response.status})`);
      writeFileSync(file, `${svg.trim()}\n`);
      console.log(`아이콘 저장: src/icons/${name}.svg`);
    }
    icons.set(name, readFileSync(file, "utf-8").trim());
  }
  return icons;
}
