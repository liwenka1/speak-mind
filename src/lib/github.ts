/**
 * 数据层：把 GitHub Issues 当作内容源。
 *
 * 约定：issue 上打的标签（见 `src/config/site.ts` 的 `sections`）决定它出现在哪个分区。
 * 这里只负责「取数据、映射类型」，不含任何 UI 逻辑。
 *
 * 公开仓库无需 token 即可读取；若配置 `GITHUB_TOKEN`（只读即可），
 * 可把接口限流从 60 次/小时提升到 5000 次/小时。
 */

import { siteConfig } from "@/config/site";

const GITHUB_API = "https://api.github.com";

/** 内容缓存时长（秒）。GitHub 匿名接口限流为 60 次/小时，靠缓存兜底。 */
export const REVALIDATE_SECONDS = 3600;

/** 单次最多拉取多少条。 */
const PAGE_SIZE = 50;

export type Entry = {
  /** issue 编号，用作路由与列表的稳定 key */
  id: number;
  title: string;
  body: string;
  /** ISO 时间字符串（UTC） */
  createdAt: string;
  /** 对应 issue 在 GitHub 上的地址 */
  url: string;
  /** 该 issue 的标签名列表 */
  labels: string[];
};

/** GitHub issues 接口返回的字段子集（该接口也会返回 PR，故有 pull_request 字段） */
type GitHubIssue = {
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  html_url: string;
  labels: Array<string | { name?: string | null }>;
  pull_request?: unknown;
};

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": siteConfig.name,
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/** 统一的时间缓存策略 + 标签（便于以后用 revalidateTag 按需刷新）。 */
const cacheConfig = {
  next: { revalidate: REVALIDATE_SECONDS, tags: ["entries"] },
};

function issuesEndpoint(): string {
  const { user, repo } = siteConfig.github;
  return `${GITHUB_API}/repos/${user}/${repo}/issues`;
}

function toEntry(issue: GitHubIssue): Entry {
  return {
    id: issue.number,
    title: issue.title,
    body: issue.body ?? "",
    createdAt: issue.created_at,
    url: issue.html_url,
    labels: issue.labels
      .map((label) => (typeof label === "string" ? label : (label.name ?? "")))
      .filter(Boolean),
  };
}

async function listIssues(label: string): Promise<Entry[]> {
  const url = new URL(issuesEndpoint());
  url.searchParams.set("state", "all");
  url.searchParams.set("labels", label);
  url.searchParams.set("sort", "created");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(PAGE_SIZE));

  const res = await fetch(url, { headers: buildHeaders(), ...cacheConfig });

  if (!res.ok) {
    throw new Error(`GitHub 接口请求失败：${res.status} ${res.statusText}`);
  }

  const issues = (await res.json()) as GitHubIssue[];

  // issues 接口会把 PR 也算进来，这里过滤掉
  return issues.filter((issue) => !issue.pull_request).map(toEntry);
}

/** 拉取某个标签下的全部内容，按创建时间倒序。 */
export async function getEntriesByLabel(label: string): Promise<Entry[]> {
  return listIssues(label);
}

/**
 * 拉取多个标签下的内容并合并去重，按创建时间倒序。
 *
 * 注意：GitHub 的 `labels` 参数是「与」语义（issue 需同时具备全部标签），
 * 所以想要「并集」只能逐个拉取后在这里合并。
 */
export async function getEntriesByLabels(
  labels: readonly string[],
): Promise<Entry[]> {
  const results = await Promise.all(labels.map((label) => listIssues(label)));

  const byId = new Map<number, Entry>();
  for (const entries of results) {
    for (const entry of entries) {
      byId.set(entry.id, entry);
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

/** 按编号拉取单条内容；不存在（404）或实为 PR 时返回 null。 */
export async function getEntry(number: number): Promise<Entry | null> {
  const res = await fetch(`${issuesEndpoint()}/${number}`, {
    headers: buildHeaders(),
    ...cacheConfig,
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub 接口请求失败：${res.status} ${res.statusText}`);
  }

  const issue = (await res.json()) as GitHubIssue;
  if (issue.pull_request) return null;

  return toEntry(issue);
}
