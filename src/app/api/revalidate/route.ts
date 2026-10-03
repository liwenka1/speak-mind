import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { siteConfig } from "@/config/site";

/**
 * GitHub Webhook：内容变动时按需刷新缓存，让发布后的更新「秒级可见」。
 *
 * ## 接口防护（都在这个文件里，没有别的入口）
 *
 * 1. **只接受 POST**。GET/HEAD 等由 Next 自动返回 405，爬虫或预取碰不到。
 * 2. **必须带 `X-Hub-Signature-256`**：用 `GITHUB_WEBHOOK_SECRET` 对**原始请求体**
 *    做 HMAC-SHA256，再用 `timingSafeEqual` 常量时间比较（防时序侧信道）。
 *    校验通过前不解析任何内容。
 * 3. **secret 没配就直接 500**（fail closed）。绝不写成「没配就跳过校验」——
 *    那是把刷新接口暴露给全网。
 * 4. **签名通过后**才看事件与仓库：只处理本仓库的 `issues` 与 `issue_comment`
 *    事件，且只处理会改变展示内容的 action；其余一律「收到但不做事」。
 * 5. **认证失败一律同一个 401**，不区分「没带签名」和「签名不对」，不给探测者反馈；
 *    也不回显 payload 或错误细节。
 *
 * 没有 secret 的人无法触发刷新，所以不需要额外的限流：洪水般的 401 只消耗一次
 * HMAC 计算的 CPU。真正的防护点是「**没有 secret 就无法让它做事**」。
 *
 * ## 本地怎么测
 *
 * 本地 dev 收不到 GitHub 的 webhook（除非开隧道），平时靠 `.env.local` 里的
 * `REVALIDATE_SECONDS=1` 立即看到内容；要单独测这个接口，就用 `.env.local` 里的
 * secret 自己签一个 body POST 过来（README 有示例）。
 */

/** 与 `src/lib/github.ts` 里 fetch 的 tags 保持一致 */
const REVALIDATE_TAG = "entries";

/**
 * 会改变页面上要展示内容的事件，以及各事件里真正有影响的 action。
 *
 * - `issues`：内容本身（标题 / 正文 / 标签 / 开关状态）
 * - `issue_comment`：评论 —— 详情页要展示评论列表，所以新增 / 修改 / 删除都得刷新
 */
const CONTENT_ACTIONS: Record<string, ReadonlySet<string>> = {
  issues: new Set([
    "opened",
    "edited",
    "deleted",
    "closed",
    "reopened",
    "labeled",
    "unlabeled",
  ]),
  issue_comment: new Set(["created", "edited", "deleted"]),
};

/** 用 node:crypto，因此必须跑在 Node.js 运行时（不是 Edge） */
export const runtime = "nodejs";

/**
 * 校验 GitHub 的 `X-Hub-Signature-256`。
 *
 * 注意：必须对**原始请求体字符串**做 HMAC —— 所以调用方要先 `text()`，
 * 不能先 `json()`，否则重新序列化出来的字节和 GitHub 签的对不上。
 */
function isValidSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  const PREFIX = "sha256=";
  if (!header?.startsWith(PREFIX)) return false;

  const received = header.slice(PREFIX.length);
  // 先确认是 64 位十六进制，否则 Buffer/比较都可能出意外
  if (!/^[0-9a-f]{64}$/i.test(received)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  return timingSafeEqual(
    Buffer.from(received, "hex"),
    Buffer.from(expected, "hex"),
  );
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[revalidate] 未配置 GITHUB_WEBHOOK_SECRET，接口不可用（拒绝请求，不做任何刷新）",
    );
    return new Response("Webhook secret is not configured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!isValidSignature(rawBody, signature, secret)) {
    // 统一的失败响应：不区分「没签名」与「签名错」
    return new Response("Unauthorized", { status: 401 });
  }

  // —— 以下内容都已通过签名校验，可以安全解析 ——
  let payload: {
    repository?: { full_name?: string };
    action?: string;
    /** 只有 issue_comment 事件带这个字段：用来区分评论在 issue 上还是在 PR 上 */
    issue?: { pull_request?: unknown };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const event = request.headers.get("x-github-event");

  // 在 GitHub 上添加 webhook 时它会先发一个 ping，回 200 表示接通
  if (event === "ping") {
    return Response.json({ ok: true, event });
  }

  const actions = event ? CONTENT_ACTIONS[event] : undefined;
  if (!actions) {
    return Response.json({ revalidated: false, reason: `ignored event: ${event}` });
  }

  const expectedRepo = `${siteConfig.github.user}/${siteConfig.github.repo}`;
  if (payload.repository?.full_name !== expectedRepo) {
    return Response.json({ revalidated: false, reason: "not our repository" });
  }

  if (!payload.action || !actions.has(payload.action)) {
    return Response.json({
      revalidated: false,
      reason: `ignored action: ${payload.action}`,
    });
  }

  // issue_comment 对 PR 也会触发，而 PR 不出现在站内 —— 没必要为它重建整站页面
  if (event === "issue_comment" && payload.issue?.pull_request) {
    return Response.json({
      revalidated: false,
      reason: "comment on a pull request",
    });
  }

  // expire: 0 —— 下次访问即阻塞式重建，保证立刻看到新内容。
  // （别用文档默认推荐的 profile="max"：那会先返回旧内容，等于「刷新了但没完全刷新」）
  revalidateTag(REVALIDATE_TAG, { expire: 0 });

  return Response.json({ revalidated: true, action: payload.action });
}
