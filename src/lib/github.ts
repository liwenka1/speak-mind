/**
 * 日记数据层：把 GitHub Issues 当作内容源。
 *
 * 约定：仓库里打了 `diary` 标签的 issue，就是这个站点上的一条日记。
 * 这些都是可在服务端读取的公开数据，因此无需 token 也能工作；
 * 若配置了 `GITHUB_TOKEN`（只读即可），可把接口限流从 60 次/小时提升到 5000 次/小时。
 */

const GITHUB_API = "https://api.github.com";

const OWNER = process.env.GITHUB_OWNER ?? "liwenka1";
const REPO = process.env.GITHUB_REPO ?? "speak-mind";
const DIARY_LABEL = process.env.DIARY_LABEL ?? "diary";

/** 日记列表的缓存时长（秒）。GitHub 匿名接口限流为 60 次/小时，靠缓存兜底。 */
export const DIARY_REVALIDATE_SECONDS = 3600;

/** 单次最多拉取多少条日记。 */
const PAGE_SIZE = 50;

export type DiaryEntry = {
  /** issue 编号，用作列表的稳定 key */
  id: number;
  title: string;
  body: string;
  /** ISO 时间字符串（UTC） */
  createdAt: string;
  /** 对应 issue 在 GitHub 上的地址 */
  url: string;
};

/** GitHub issues 接口返回的字段子集（该接口也会返回 PR，故有 pull_request 字段） */
type GitHubIssue = {
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  html_url: string;
  pull_request?: unknown;
};

/** 拉取全部日记，按创建时间倒序（最新的在前）。 */
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const url = new URL(`${GITHUB_API}/repos/${OWNER}/${REPO}/issues`);
  url.searchParams.set("state", "all");
  url.searchParams.set("labels", DIARY_LABEL);
  url.searchParams.set("sort", "created");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(PAGE_SIZE));

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "speak-mind",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: DIARY_REVALIDATE_SECONDS, tags: ["diary"] },
  });

  if (!res.ok) {
    throw new Error(`GitHub 接口请求失败：${res.status} ${res.statusText}`);
  }

  const issues = (await res.json()) as GitHubIssue[];

  return issues
    // issues 接口会把 PR 也算进来，这里过滤掉
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      id: issue.number,
      title: issue.title,
      body: issue.body ?? "",
      createdAt: issue.created_at,
      url: issue.html_url,
    }));
}
