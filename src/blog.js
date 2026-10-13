// 블로그 RSS에서 최신 글을 가져옵니다. 날짜는 블로그 화면과 같은 YYYY.MM.DD 형식으로 맞춥니다.
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: { Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8" },
});

const formatDate = (date) =>
  [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()].map((part) => String(part).padStart(2, "0")).join(".");

export async function fetchPosts({ feed, count }) {
  const { items } = await parser.parseURL(feed);
  const posts = items
    .map((item, order) => ({
      title: (item.title ?? "").replace(/\s+/g, " ").trim(),
      link: item.link,
      time: new Date(item.isoDate ?? item.pubDate).getTime(),
      order,
    }))
    .filter((post) => post.title && post.link && Number.isFinite(post.time))
    // 같은 날짜의 글은 피드에 적힌 순서를 유지합니다.
    .sort((a, b) => b.time - a.time || a.order - b.order)
    .slice(0, count)
    .map(({ title, link, time }) => ({ title, link, date: formatDate(new Date(time)) }));

  // 피드를 못 읽었는데 빈 목록으로 README를 덮어쓰지 않도록 여기서 멈춥니다.
  if (posts.length === 0) throw new Error(`블로그 글을 찾지 못했습니다: ${feed}`);
  return posts;
}
