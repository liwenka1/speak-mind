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

/** 内容缓存时长的默认值（秒）：1 小时。 */
const DEFAULT_REVALIDATE_SECONDS = 3600;

/**
 * 内容缓存时长（秒）。
 *
 * 默认 1 小时 —— GitHub 匿名接口限流 60 次/小时，靠缓存兜底；配了 PAT 后限额
 * 是 5000 次/小时，可以调小以缩短"发布 → 页面可见"的延迟。
 *
 * 本地调试在 `.env.local` 里写 `REVALIDATE_SECONDS=1` 即可，不用改代码。
 * 注意这里只管**数据缓存**；页面级缓存是另外两个字面量（见 rewrite 说明）。
 */
function resolveRevalidateSeconds(): number {
  const raw = process.env.REVALIDATE_SECONDS?.trim();
  if (!raw) return DEFAULT_REVALIDATE_SECONDS;

  const seconds = Number(raw);
  // 填了非法值就退回默认，别把 NaN 传给 Next
  return Number.isFinite(seconds) && seconds >= 0
    ? seconds
    : DEFAULT_REVALIDATE_SECONDS;
}

export const REVALIDATE_SECONDS = resolveRevalidateSeconds();

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
  /**
   * 评论条数 —— GitHub 的 issue 对象自带这个数字，**不需要**再调 comments 接口。
   *
   * 本站只做展示：评论不在站内渲染，只用它决定底部入口的文案（有 / 没有评论）。
   */
  commentCount: number;
};

/**
 * issue 下的一条评论。
 *
 * 本站**只读展示**评论 —— 不在站内发评论，想发言去 GitHub。
 */
export type Comment = {
  /** 评论 id，用作列表的稳定 key */
  id: number;
  /** 评论者用户名；账号已注销时 GitHub 自己的界面显示为 ghost */
  author: string;
  /** 评论者头像地址；拿不到时是空串，UI 里就不渲染头像 */
  avatarUrl: string;
  /** GFM 正文 */
  body: string;
  /** ISO 时间字符串（UTC） */
  createdAt: string;
  /** 这条评论在 GitHub 上的地址 */
  url: string;
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
  /** 评论条数：issue 对象自带，省掉一次 comments 接口请求 */
  comments?: number;
};

/** GitHub comments 接口返回的字段子集 */
type GitHubComment = {
  id: number;
  body: string | null;
  created_at: string;
  html_url: string;
  user: { login?: string | null; avatar_url?: string | null } | null;
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
    commentCount: issue.comments ?? 0,
  };
}

async function listIssues(label: string): Promise<Entry[]> {
  const url = new URL(issuesEndpoint());
  // 只收 open：关闭 issue 就等于「从列表下架」（详情页仍能读到，见 getEntry 的说明）
  url.searchParams.set("state", "open");
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

/**
 * 按编号拉取单条内容；不存在（404）或实为 PR 时返回 null。
 *
 * **不看 state**：关闭的 issue 仍然取得到 —— 关闭只是把它从分区列表里摘掉，
 * 已经发出去的链接不会断。要不要展示由调用方再判一次分区标签（见详情页）。
 */
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

function toComment(comment: GitHubComment): Comment {
  return {
    id: comment.id,
    // 账号注销后 user 是 null，GitHub 自己的界面显示为 ghost，这里保持一致
    author: comment.user?.login || "ghost",
    avatarUrl: comment.user?.avatar_url ?? "",
    body: comment.body ?? "",
    createdAt: comment.created_at,
    url: comment.html_url,
  };
}

/** 评论接口每页最多 100 条 */
const COMMENTS_PAGE_SIZE = 100;

/** 最多翻多少页 —— 个人站点远到不了，纯粹是给循环一个上界 */
const MAX_COMMENT_PAGES = 10;

/**
 * 拉取某条 issue 下的全部评论，按时间正序（旧 → 新，GitHub 的默认顺序）。
 *
 * 评论只**展示**，这个函数只读不写 —— 想发言得去 GitHub。
 * 超过一页会一直翻到取完（上界见 `MAX_COMMENT_PAGES`）。
 */
export async function getComments(number: number): Promise<Comment[]> {
  const comments: Comment[] = [];

  for (let page = 1; page <= MAX_COMMENT_PAGES; page += 1) {
    const url = new URL(`${issuesEndpoint()}/${number}/comments`);
    url.searchParams.set("per_page", String(COMMENTS_PAGE_SIZE));
    url.searchParams.set("page", String(page));

    const res = await fetch(url, { headers: buildHeaders(), ...cacheConfig });

    if (!res.ok) {
      throw new Error(`GitHub 接口请求失败：${res.status} ${res.statusText}`);
    }

    const batch = (await res.json()) as GitHubComment[];
    comments.push(...batch.map(toComment));

    // 不满一页说明已经到底
    if (batch.length < COMMENTS_PAGE_SIZE) break;
  }

  return comments;
}
