/**
 * 站点配置 —— 全站信息的唯一来源。
 *
 * ## 结构规则
 *
 * 1. **站点身份**：`name` / `lang` / `timeZone` / `description`
 * 2. **人**：`author`（显示名、邮箱、其他外链）、`github`（用户名、仓库名）
 * 3. **页面**：`pages`（固定页）、`sections`（分区）、`text`（文案，键与页面对应）
 *
 * ## 去重规则（重要）
 *
 * 同一个**事实**只写一次，其他地方一律引用或推导：
 * - URL 不是独立事实：GitHub 主页与仓库地址都由 `github` 拼出来（见 `githubUrl` / `repoUrl`），
 *   不要在配置里手写 `https://github.com/...`；
 * - 页面名字写在 `pages` / `sections` 里，文案要用时写 `{title}`，不要重抄一遍；
 * - 站名、年份、标签名、错误信息分别用 `{name}` `{year}` `{label}` `{error}` 占位符填入。
 * - 但「值恰好相同」不等于「同一个事实」：作者显示名（`author.name`）与 GitHub 用户名
 *   （`github.user`）当前都是 liwenka1，将来会各自变化（比如显示名改成中文名），
 *   所以**故意分开配置**，不要合并。
 *
 * ## 可以接受的重复
 *
 * 去重只针对「会一起变化的事实」，下面这些重复是**故意**的，不要"优化"掉：
 * - `github.repo` 与 `name` 可能同值，但站名与仓库名是两个事实（见字段注释）；
 * - `package.json` 的包名与 `name`：npm 标识读不到 TS 配置；
 * - 上面的 `type SiteConfig` 与下面的字面量：类型是形状契约，换来编辑期校验与补全；
 * - README 里的配置示例：文档，需与配置同步。
 *
 * 文案里的 `{xxx}` 占位符由 `src/lib/template.ts` 填充。
 */

export type SiteLink = {
  /** 链接显示的名字 */
  label: string;
  href: string;
};

/** 固定页面（首页 / 关于）：导航文案、页面标题、页内大标题共用同一份配置 */
export type SitePage = {
  /** 路径 */
  href: string;
  /** 导航与页面标题里显示的名字 */
  title: string;
};

export type SiteSection = {
  /** 导航与页面标题里显示的名字 */
  title: string;
  /** 对应的 GitHub issue 标签：打了这个标签的 issue 会出现在该分区 */
  label: string;
};

type SiteConfig = {
  /** 站名：顶栏、页脚版权、页面标题后缀都用它 */
  name: string;
  /** <html lang>，也是日期格式化用的语言 */
  lang: string;
  /** 日期显示使用的时区 */
  timeZone: string;
  /** 站点描述：首页的 meta description */
  description: string;

  /** 站长本人 */
  author: {
    /** 显示名：首页自我介绍里会加粗显示 */
    name: string;
    /** 邮箱：填了就自动出现在首页「找我」与页脚；留空则不显示 */
    email: string;
    /**
     * 其他平台的外链（X、微博、Telegram…）。
     *
     * GitHub 主页与邮箱由 `github` / `author.email` 推导，**不要写在这里**，
     * 否则同一个地址会出现在两个地方。
     */
    links: SiteLink[];
  };

  /**
   * GitHub：用户名与仓库名各写一次。
   *
   * 个人主页（`githubUrl()`）与内容仓库地址（`repoUrl()`）都由这里拼出来，
   * 所以配置里、组件里都不该再出现完整的 github.com 链接。
   */
  github: {
    /** 用户名 */
    user: string;
    /**
     * 存放内容的仓库名。
     *
     * 故意不默认取 `name`：站名与仓库名是两个事实，站名改了仓库未必改，
     * "留空就用站名"会把错仓库静默拼进链接，宁可多写一行。
     */
    repo: string;
  };

  /**
   * 固定页面。导航结构固定为：**首页 + 下面 `sections` 里配置的分区 + 关于**，
   * 首尾两项的名字与路径来自这里。
   */
  pages: {
    home: SitePage;
    about: SitePage;
  };

  /** 中间的分区（首页与关于是固定的，不需要写在这里） */
  sections: SiteSection[];

  /** 页面文案：改措辞只动这里 */
  text: {
    /** 首页 */
    home: {
      /** 首屏问候：加粗的作者名插在 before 与 after 之间 */
      greeting: {
        /** 以空格结尾，和后面的作者名隔开 */
        before: string;
        after: string;
      };
      /** 问候下面那段介绍 */
      intro: string;
      /** 「在做」区块 */
      doing: {
        title: string;
        items: string[];
      };
      /** 「分区」区块；`hint` 里的 `{label}` 会渲染成 code 样式的标签名 */
      sections: {
        title: string;
        /** 以空格开头，用来和上面的分区名隔开 */
        hint: string;
      };
      /** 「找我」区块：链接来自 author.links / author.email */
      contact: {
        title: string;
      };
    };

    /** 关于页 */
    about: {
      /** 浏览器标签页上的描述；`{title}` 关于页标题、`{name}` 站名 */
      description: string;
      /** 首段（正常字色） */
      lead: string;
      /** 后续段落（浅色，可增删，一段一条） */
      paragraphs: string[];
    };

    /** 分区列表页 /tag/<label> */
    section: {
      /** 浏览器标签页上的描述；`{name}` 站名、`{title}` 分区名 */
      description: string;
      /** 标题下的说明；`{label}` 渲染成 code 样式的标签名 */
      hint: string;
      /** 该分区还没内容时的空状态（用 shadcn 的 Empty 组件渲染） */
      empty: {
        /** 说明；`{label}` 渲染成 code 样式的标签名 */
        description: string;
        /** 按钮文案：点进 GitHub 新建 issue，分区标签已预填 */
        action: string;
      };
      /** 读取失败时（也用 Empty 渲染）；`{error}` 是具体错误 */
      error: string;
    };

    /** 内容详情页 /entry/<编号> */
    entry: {
      /** 读取失败时；`{error}` 是具体错误 */
      error: string;
      /** 这条内容没有正文时 */
      emptyBody: string;
      /** 跳回 GitHub 原文的链接文案 */
      viewOnGitHub: string;
    };

    /** 页脚 */
    footer: {
      /** `{year}` 当前年份、`{name}` 站名 */
      copyright: string;
    };

    /** 由配置推导出来的链接的显示名（地址本身由 github / author.email 推导） */
    links: {
      /** GitHub 个人主页 */
      github: string;
      /** 邮箱 */
      email: string;
      /** 本站源码（内容仓库） */
      source: string;
    };

    /** 浏览器标签页：子页面标题会被拼成「某某 · 站名」，`%s` 是子标题 */
    titleTemplate: string;

    /** 主题切换按钮上读屏用的文案 */
    theme: {
      toLight: string;
      toDark: string;
      /** 还没水合完成、主题未确定时 */
      unknown: string;
    };

    /** 各处通用文案 */
    common: {
      /** 抓到非 Error 对象时的兜底提示 */
      unknownError: string;
    };
  };
};

export const siteConfig: SiteConfig = {
  name: "speak-mind",
  lang: "zh-CN",
  timeZone: "Asia/Shanghai",
  description: "个人主页与日记 —— 由 Next.js 与 GitHub Issues 驱动。",

  author: {
    name: "liwenka1",
    email: "",
    // GitHub 主页不写这里，见下面的 github 配置
    links: [],
  },

  github: {
    user: "liwenka1",
    repo: "speak-mind",
  },

  pages: {
    home: { href: "/", title: "首页" },
    about: { href: "/about", title: "关于" },
  },

  sections: [
    { title: "日记", label: "diary" },
    { title: "三言两语", label: "note" },
    { title: "随笔", label: "essay" },
  ],

  text: {
    home: {
      greeting: {
        before: "Hey! 我是 ",
        after: "，一个喜欢把想法随手记下来的人。",
      },
      intro:
        "这里放一段更长的自我介绍：比如你在做什么、关心什么、平时写点什么。",
      doing: {
        title: "在做",
        items: ["某个项目 / 工作 —— 一句话说明", "另一件事 —— 一句话说明"],
      },
      sections: {
        title: "分区",
        hint: " —— 打上 {label} 标签的 issue",
      },
      contact: {
        title: "找我",
      },
    },

    about: {
      description: "{title} {name}",
      lead: "这里是「关于」页的占位内容 —— 可以写你是谁、在做什么、为什么写这个站点。",
      paragraphs: [
        "本站用 Next.js 搭建，内容直接以 GitHub Issues 作为数据源：给 issue 打上对应分区的标签，它就会出现在相应页面里。",
      ],
    },

    section: {
      description: "{name} 的{title}",
      hint: "来自 GitHub Issues —— 打了 {label} 标签的内容会出现在这里。",
      empty: {
        description: "打上 {label} 标签的 issue 会自动出现在这个分区里。",
        action: "去 GitHub 写一条",
      },
      error: "暂时读不到内容：{error}",
    },

    entry: {
      error: "暂时读不到这篇内容：{error}",
      emptyBody: "（无正文）",
      viewOnGitHub: "在 GitHub 查看 →",
    },

    footer: {
      copyright: "© {year} {name}",
    },

    links: {
      github: "GitHub",
      email: "邮箱",
      source: "源码",
    },

    titleTemplate: "%s · {name}",

    theme: {
      toLight: "切换到浅色",
      toDark: "切换到深色",
      unknown: "切换主题",
    },

    common: {
      unknownError: "未知错误",
    },
  },
};

/** GitHub 个人主页（由 github.user 推导） */
export function githubUrl(): string {
  return `https://github.com/${siteConfig.github.user}`;
}

/** 内容仓库地址（由 github 推导，页脚「源码」链接用） */
export function repoUrl(): string {
  const { user, repo } = siteConfig.github;
  return `https://github.com/${user}/${repo}`;
}

/** 新建 issue 的地址（分区标签已预填），空状态里的按钮用 */
export function newIssueUrl(label: string): string {
  const { user, repo } = siteConfig.github;
  return `https://github.com/${user}/${repo}/issues/new?labels=${encodeURIComponent(label)}`;
}

/**
 * 首页「找我」与页脚共用的外链。
 *
 * GitHub 主页与邮箱都在这里由配置推导出来，所以 `author.links` 只放其他平台，
 * 否则同一个地址会写在两个地方。
 */
export function authorLinks(): SiteLink[] {
  const { email, links } = siteConfig.author;
  const labels = siteConfig.text.links;

  return [
    { label: labels.github, href: githubUrl() },
    ...(email ? [{ label: labels.email, href: `mailto:${email}` }] : []),
    ...links,
  ];
}

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
