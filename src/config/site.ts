/**
 * 站点配置。
 *
 * 导航结构固定为：**首页 + 下面 `sections` 里配置的分区 + 关于**。
 * 想增删分区、改名字或换标签，只改 `sections` 即可，导航和页面会自动跟着变。
 */

export type SiteSection = {
  /** 导航与页面标题里显示的名字 */
  title: string;
  /** 对应的 GitHub issue 标签：打了这个标签的 issue 会出现在该分区 */
  label: string;
};

type SiteConfig = {
  name: string;
  description: string;
  /** 存放内容的 GitHub 仓库 */
  repo: {
    owner: string;
    name: string;
  };
  /** 中间的分区（首页与关于是固定的，不需要写在这里） */
  sections: SiteSection[];
};

export const siteConfig: SiteConfig = {
  name: "speak-mind",
  description: "个人主页与日记 —— 由 Next.js 与 GitHub Issues 驱动。",
  repo: {
    owner: "liwenka1",
    name: "speak-mind",
  },
  sections: [
    { title: "日记", label: "diary" },
    { title: "三言两语", label: "note" },
    { title: "随笔", label: "essay" },
  ],
};

/** 分区列表页路径 */
export function sectionPath(label: string): string {
  return `/tag/${label}`;
}

/** 内容详情页路径 */
export function entryPath(id: number): string {
  return `/entry/${id}`;
}

/** 按 label 查分区配置 */
export function findSection(label: string): SiteSection | undefined {
  return siteConfig.sections.find((section) => section.label === label);
}
