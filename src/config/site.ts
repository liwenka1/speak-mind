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
 * - URL 不是独立事实：GitHub 主页、仓库地址与新建 issue 的地址都由 `github` 拼出来
 *   （见 `githubUrl` / `repoUrl` / `newIssueUrl`），
 *   不要在配置里手写 `https://github.com/...`；
 * - 页面名字写在 `pages` / `sections` 里，文案要用时写 `{title}`，不要重抄一遍；
 * - 站名、作者显示名、年份、错误信息分别用 `{name}` `{author}` `{year}` `{error}` 占位符填入。
 * - 但「值恰好相同」不等于「同一个事实」：作者显示名（`author.name`）与 GitHub 用户名
 *   （`github.user`）就是两个值（VVenKAI / liwenka1），将来还会各自变化（比如显示名改成
 *   中文名），所以**故意分开配置**，不要合并。
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

/**
 * 首页「在做」里的一条：短标签 + 说明，说明后面可以跟几个仓库小标签。
 *
 * 拆成结构化字段（而不是一整句自由文本）是为了让项目名能被渲染成小标签；
 * 句子照样只写在配置里，组件只管排版。
 */
type HomeDoingItem = {
  /** 短标签（中黑显示，后面自动跟一个「：」） */
  label: string;
  /** 说明文字；这一条只有仓库小标签时可以不写 */
  text?: string;
  /**
   * 跟在后面的仓库小标签 —— 只写**仓库名**，地址由 `github.user` 推导
   * （见 `repoUrl()`），不要在配置里手写完整地址。
   */
  repos?: string[];
  /** 小标签之后再接的一段文字（如「，GitHub 累计 340+ stars」） */
  after?: string;
};

type SiteConfig = {
  /** 站名：顶栏、页脚版权、页面标题后缀都用它 */
  name: string;
  /** <html lang>，也是日期格式化用的语言 */
  lang: string;
  /** 日期显示使用的时区 */
  timeZone: string;
  /** 站点描述：首页的 meta description；可以用 `{name}` `{author}` 占位符 */
  description: string;

  /** 站长本人 */
  author: {
    /** 显示名：首页的大标题（h1）就是它，`{author}` 占位符也填这个值 */
    name: string;
    /** 邮箱：填了就出现在首页「找我」那一行与顶栏；留空则不显示 */
    email: string;
    /**
     * 其他平台的外链（Twitter、微博、Telegram…）。
     *
     * GitHub 主页与邮箱由 `github` / `author.email` 推导，**不要写在这里**，
     * 否则同一个地址会出现在两个地方。
     */
    links: SiteLink[];
  };

  /**
   * GitHub：用户名与仓库名各写一次。
   *
   * 个人主页（`githubUrl()`）与新建 issue 的地址（`newIssueUrl()`，仓库名在这里用）
   * 都由这里拼出来，所以配置里、组件里都不该再出现完整的 github.com 链接。
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
   * 固定页面。顶栏导航 = 下面 `sections` 里配置的分区 + 关于 —— **没有「首页」**：
   * 左上角的站标就是回首页的入口，不占导航里的一格。
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
      /**
       * 首段：一句话说清「我是谁、这里写什么」。
       *
       * 页面大标题（h1）就是作者名（`author.name`），所以这里不用再写一遍名字，
       * 要提就用 `{author}` 占位符。
       */
      intro: string;
      /** 「在做」那一段 */
      doing: {
        /** 段落引子（渲染成「在做：」），后面接 items 里的几条 */
        title: string;
        items: HomeDoingItem[];
      };
      /**
       * 「找我」：只有引子 —— 下面那一行联系方式（GitHub / 邮箱 / 其他平台）
       * 直接来自 `authorLinks()`，与顶栏同一份、同顺序。
       */
      contact: {
        /** 引子（「找我」） */
        title: string;
      };
    };

    /** 关于页 */
    about: {
      /** 浏览器标签页上的描述；`{title}` 关于页标题、`{author}` 作者显示名 */
      description: string;
      /** 首段（正常字色）；`{author}` 也可以写在里面 */
      lead: string;
      /** 后续段落（浅色，可增删，一段一条）；同样支持 `{author}` */
      paragraphs: string[];
    };

    /** 分区列表页 /tag/<label> */
    section: {
      /** 浏览器标签页上的描述；`{name}` 站名、`{title}` 分区名 */
      description: string;
      /**
       * 该分区还没内容时的空状态（用 shadcn 的 Empty 组件渲染）。
       *
       * 骨架照官方 Empty 的 example：图标 + 标题 + **一行说明** + 两个动作
       * （一个实心主按钮 + 一条次级文字链）。说明那行不能省 —— 空状态好看的
       * 本质是「留白 + 文字层次」，只剩一行标题时，四周的留白就没东西撑着，
       * 看着就是个空洞。
       */
      empty: {
        /** 空状态标题 */
        title: string;
        /** 空状态说明；`{label}` 是这个分区对应的 GitHub 标签名 */
        description: string;
        /** 主按钮文案：点进 GitHub 新建 issue，分区标签已预填 */
        action: string;
        /** 次级入口的文案（文字链）：去关于页看这个站是怎么运作的 */
        guide: string;
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
      /**
       * 评论区。评论在站内**只读展示** —— 不在这里发评论，
       * 想发言就点 `join` 去对应的 issue。
       */
      comments: {
        /** 有评论时的标题；`{count}` 是评论条数 */
        title: string;
        /** 没有评论时的标题（不带数量，免得出现「评论（0）」） */
        titleEmpty: string;
        /** 有评论、但评论读取失败时；`{error}` 是具体错误 */
        error: string;
        /** 一条评论都没有时 */
        empty: string;
        /** 底部入口：去 GitHub 看评论 / 发言（和「看原文」是同一个地址） */
        join: string;
      };
    };

    /** 页脚 */
    footer: {
      /** `{year}` 当前年份、`{author}` 作者显示名 */
      copyright: string;
    };

    /** 由配置推导出来的链接的显示名（地址本身由 github / author.email 推导） */
    links: {
      /** GitHub 个人主页 */
      github: string;
      /** 邮箱 */
      email: string;
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
  description: "{author} 的个人站：日记、三言两语与随笔，内容由 GitHub Issues 驱动。",

  author: {
    name: "VVenKAI",
    email: "2020583117@qq.com",
    // GitHub 主页不写这里，见下面的 github 配置
    links: [
      // 本站就是主站，所以这里不放「主站」链接；只列其他平台
      { label: "Twitter", href: "https://x.com/liwenka1" },
    ],
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
      intro:
        "嗨，我是 {author}，一名软件工程师 和 开源爱好者。",
      doing: {
        title: "在做",
        items: [
          {
            label: "写代码",
            text: "前端为主（React / Next.js + TypeScript），也写过一点后端（Node.js / NestJS / Prisma）",
          },
          {
            label: "做开源",
            repos: ["next-web-nav", "vven-tools", "video-to-ppt"],
            after: "，GitHub 累计 340+ stars",
          },
          {
            label: "写东西",
            text: "先在 GitHub Issues 里写，打上分区标签就发布到这个站",
          },
        ],
      },
      contact: {
        title: "找我",
      },
    },

    about: {
      description: "{title} {author} —— 前端开发、开源项目，以及这个站是怎么运作的。",
      lead: "我是 {author}，前端开发为主，React / Next.js + TypeScript 是主力栈，平时也维护几个自己的开源小项目。",
      paragraphs: [
        "本行是前端：React / Next.js / Vue / Nuxt 都写过，工具链常用 Vite 与 Tailwind CSS；后端碰过一点 Node.js（NestJS、Prisma），部署多走 Vercel、Docker 与 Nginx。2017–2021 在湖南城市学院读的本科。",
        "工作之外：周末的篮球场常客（自称急停跳投专业户），追番清单永远比 TODO 列表长，Steam 库存还在持续 +1。",
        "本站用 Next.js 搭建，内容直接以 GitHub Issues 作为数据源：给 issue 打上对应分区的标签，它就会出现在相应页面里。",
      ],
    },

    section: {
      description: "{name} 的{title}",
      empty: {
        title: "还没有内容",
        description: "打上 {label} 标签的 issue 会自动出现在这个分区里。",
        action: "去 GitHub 写一条",
        guide: "这个站是怎么运作的",
      },
      error: "暂时读不到内容：{error}",
    },

    entry: {
      error: "暂时读不到这篇内容：{error}",
      emptyBody: "（无正文）",
      comments: {
        title: "评论（{count}）",
        titleEmpty: "评论",
        error: "读不到评论：{error}",
        empty: "还没有评论。",
        join: "去 GitHub 参与讨论 →",
      },
    },

    footer: {
      copyright: "© {year} {author}",
    },

    links: {
      github: "GitHub",
      email: "邮箱",
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

/** 某个仓库的地址（由 github.user 推导）；首页「在做」里的仓库小标签用 */
export function repoUrl(repo: string): string {
  return `https://github.com/${siteConfig.github.user}/${repo}`;
}

/** 新建 issue 的地址（分区标签已预填），空状态里的按钮用 */
export function newIssueUrl(label: string): string {
  const { user, repo } = siteConfig.github;
  return `https://github.com/${user}/${repo}/issues/new?labels=${encodeURIComponent(label)}`;
}

/**
 * 首页「找我」与顶栏共用的外链。
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

/**
 * 一条内容命中了哪些已配置的分区。
 *
 * 标签名按**大小写不敏感**比较：GitHub 的 `labels=` 过滤是大小写不敏感的
 * （标签名本身也不允许只差大小写地重复），而详情页以前用的是严格相等 ——
 * 配置写 `diary`、GitHub 上实际是 `Diary` 时，列表能出内容、详情页却会 404。
 *
 * 参数用结构化类型而不是 `Entry`，避免 config 反向依赖数据层。
 */
export function sectionsOf(entry: { labels: string[] }): SiteSection[] {
  const labels = new Set(entry.labels.map((label) => label.toLowerCase()));

  return siteConfig.sections.filter((section) =>
    labels.has(section.label.toLowerCase()),
  );
}
