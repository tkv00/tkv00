// README.md 본문을 만듭니다. 이미지 주소에는 내용 해시를 붙여 GitHub 캐시 때문에 옛 이미지가 남지 않게 합니다.

const streakUrl = (user) =>
  `https://streak-stats.demolab.com?${new URLSearchParams({
    user,
    locale: "ko",
    background: "135,0A1030,170B36",
    border: "2A3A66",
    stroke: "2A3A66",
    ring: "A78BFA",
    fire: "F472B6",
    currStreakNum: "E6EDF3",
    sideNums: "E6EDF3",
    currStreakLabel: "67E8F9",
    sideLabels: "93C5FD",
    dates: "7A88AD",
    border_radius: "16",
  })}`;

const badge = (label, message, color, labelColor, logo) =>
  `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message.replace(/-/g, "--"))}-${color}?style=for-the-badge&labelColor=${labelColor}${logo ? `&logo=${logo}&logoColor=white` : ""}`;

const attr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function renderReadme({ profile, blog, posts, projects, openSource, sections, src }) {
  const img = (path, alt, extra = "") => `<img src="${src(path)}" width="100%"${extra} alt="${attr(alt)}">`;
  const section = (key) => img(sections[key].path, `${sections[key].title} ${sections[key].subtitle}`);
  const streak = streakUrl(profile.github);

  const projectCards = projects
    .map(({ project, path }) => `<a href="${attr(project.url)}"><img src="${src(path)}" width="49%" alt="${attr(`${project.name}: ${project.description}`)}"></a>`)
    .join("\n");

  // align="top"이 이미지 아래 글자 여백을 없애서 조각난 이미지가 한 장의 카드처럼 붙습니다.
  const blogRows = [
    `<a href="${attr(blog.url)}"><img src="${src("assets/blog/header.svg")}" width="100%" align="top" alt="최근 블로그 글"></a><br>`,
    ...posts.map(
      (post, i) =>
        `<a href="${attr(post.link)}"><img src="${src(`assets/blog/post-${i + 1}.svg`)}" width="100%" align="top" alt="${attr(`${post.title} (${post.date})`)}"></a><br>`,
    ),
    `<a href="${attr(blog.url)}"><img src="${src("assets/blog/footer.svg")}" width="100%" align="top" alt="블로그 전체 글 보기"></a>`,
  ].join("\n");

  const openSourceCards = openSource
    .map(({ contribution, path }) => `<a href="${attr(contribution.url)}">${img(path, `${contribution.repo} #${contribution.number} ${contribution.title}`)}</a>`)
    .join("\n");

  // 섹션은 <p>로 감싸 일정한 간격을 두고, 섹션 제목과 내용 사이는 <br>로만 띄웁니다.
  const block = (...lines) => `<p>\n${lines.join("\n")}\n</p>`;
  const sectionBlock = (key, content) => `<br>\n\n${block(`${section(key)}<br>`, content)}`;

  return `<!-- 이 파일은 \`npm start\`(index.js)가 자동으로 만듭니다. 내용은 src/profile.js에서 고쳐 주세요. -->
<div align="center">

${block(img("assets/hero.svg", `${profile.name.ko} (${profile.name.en}) | ${profile.role} | ${profile.tagline}`))}

${block(
  `<a href="${attr(blog.url)}"><img src="${attr(badge("Blog", blog.url.replace(/^https?:\/\/|\/$/g, ""), "8B5CF6", "1E1B4B", "astro"))}" alt="Blog"></a>`,
  `<a href="mailto:${profile.email}"><img src="${attr(badge("Email", profile.email, "38BDF8", "0B1A3A", "gmail"))}" alt="Email"></a>`,
  `<a href="https://solved.ac/${profile.solvedac}/"><img src="${attr(badge("solved.ac", profile.solvedac, "F472B6", "3B0A2A"))}" alt="solved.ac"></a>`,
)}

${block(profile.intro)}

${sectionBlock("stack", img("assets/stack.svg", "기술 스택"))}

${sectionBlock("missions", projectCards)}

${sectionBlock("openSource", openSourceCards)}

${sectionBlock("blog", blogRows)}

${sectionBlock("flightLog", img("assets/flight-log.svg", "활동과 자격증"))}

${sectionBlock(
  "telemetry",
  [
    `<img src="https://raw.githubusercontent.com/${profile.github}/${profile.github}/output/space-shooter.gif" width="100%" alt="GitHub 기여 기록 우주 슈팅 게임"><br>`,
    `<a href="https://git.io/streak-stats"><img src="${attr(streak)}" width="52%" alt="GitHub Streak"></a>`,
    `<a href="https://solved.ac/${profile.solvedac}/"><img src="https://mazassumnida.wtf/api/v2/generate_badge?boj=${profile.solvedac}" width="42%" alt="solved.ac 프로필"></a>`,
  ].join("\n"),
)}

<br>

${block(img("assets/footer.svg", "Thanks for visiting"))}

</div>
`;
}
