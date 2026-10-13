// README.md와 assets/ 아래 SVG를 모두 다시 만듭니다.
// 블로그 RSS를 먼저 읽고, 실패하면 아무 파일도 건드리지 않고 종료합니다.
import { createHash } from "crypto";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
import { fetchPosts } from "./src/blog.js";
import { loadIcons } from "./src/icons.js";
import { activities, blog, certificates, openSource, profile, projects, skills } from "./src/profile.js";
import { renderReadme } from "./src/readme.js";
import { renderBlogFooter, renderBlogHeader, renderBlogRow } from "./src/svg/blog.js";
import { renderFlightLog } from "./src/svg/flightlog.js";
import { renderFooter } from "./src/svg/footer.js";
import { renderHero } from "./src/svg/hero.js";
import { renderOpenSource } from "./src/svg/opensource.js";
import { renderProject } from "./src/svg/project.js";
import { renderSection } from "./src/svg/section.js";
import { renderStack } from "./src/svg/stack.js";

const SECTIONS = [
  ["stack", "TECH STACK", "기술 스택"],
  ["missions", "MISSIONS", "프로젝트"],
  ["openSource", "OPEN SOURCE", "오픈소스 기여"],
  ["blog", "TRANSMISSIONS", "기술 블로그"],
  ["flightLog", "FLIGHT LOG", "활동 & 자격증"],
  ["telemetry", "TELEMETRY", "기여 기록 & 알고리즘"],
];

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const posts = await fetchPosts(blog);
posts.forEach((post) => console.log(`${post.date}  ${post.title}\n            ${post.link}`));

const icons = await loadIcons(skills.flatMap((group) => group.items.map(([icon]) => icon)));
const files = new Map();

files.set("assets/hero.svg", renderHero(profile));
files.set("assets/stack.svg", renderStack(skills, icons));
files.set("assets/flight-log.svg", renderFlightLog(activities, certificates));
files.set("assets/footer.svg", renderFooter(profile));

const sections = Object.fromEntries(
  SECTIONS.map(([key, title, subtitle], i) => {
    const path = `assets/sections/${String(i + 1).padStart(2, "0")}-${slug(title)}.svg`;
    files.set(path, renderSection({ index: i + 1, total: SECTIONS.length, title, subtitle }));
    return [key, { path, title, subtitle }];
  }),
);

const projectCards = projects.map((project, i) => {
  const mission = projects.length - i;
  const path = `assets/projects/${String(mission).padStart(2, "0")}-${slug(project.name)}.svg`;
  files.set(path, renderProject(project, mission));
  return { project, path };
});

const openSourceCards = openSource.map((contribution) => {
  const path = `assets/open-source/${slug(contribution.repo.split("/").pop())}-${contribution.number}.svg`;
  files.set(path, renderOpenSource(contribution));
  return { contribution, path };
});

files.set("assets/blog/header.svg", renderBlogHeader());
posts.forEach((post, i) => files.set(`assets/blog/post-${i + 1}.svg`, renderBlogRow(post, i)));
files.set("assets/blog/footer.svg", renderBlogFooter(blog));

const src = (path) => {
  const content = files.get(path);
  if (!content) throw new Error(`생성되지 않은 이미지입니다: ${path}`);
  return `${path}?v=${createHash("sha1").update(content).digest("hex").slice(0, 8)}`;
};

const readme = renderReadme({ profile, blog, posts, projects: projectCards, openSource: openSourceCards, sections, src });

// 지난 실행에서 만든 이미지 중 더 이상 쓰지 않는 파일이 남지 않도록 assets/를 통째로 다시 씁니다.
rmSync("assets", { recursive: true, force: true });
for (const [path, content] of files) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
writeFileSync("README.md", readme);
console.log(`README.md와 이미지 ${files.size}개를 만들었습니다.`);
