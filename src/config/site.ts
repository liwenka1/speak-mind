/**
 * 站点配置 —— 全站信息的唯一来源。
 *
 * 个人信息、口号、页面文案、外链、分区都写在这里，组件里不再出现硬编码文案：
 * 想改站点的任何一句话，只动这个文件。
 *
 * 文案里的 `{xxx}` 是占位符（见 `src/lib/template.ts`），渲染时填值：
 * 整句写在配置里，动态的值（站名、标签名、年份、错误信息）由代码填入。
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
  /** <html lang> */
  lang: string;
  /** 站点描述：首页的 meta description */
  description: string;

  /** 个人信息 */
  author: {
    /** 作者名：首页自我介绍里会加粗显示 */
    name: string;
    /** 想公开邮箱就填这里（首页「找我」与页脚会自动多出一条链接）；留空则不显示 */
    email: string;
    /** 作者外链：首页「找我」与页脚共用同一份 */
    links: SiteLink[];
  };

  /** 存放内容的 GitHub 仓库（页脚的「源码」链接也由它推导） */
  repo: {
    owner: string;
    name: string;
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
      /** 浏览器标签页上的描述；`{name}` 站名 */
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
      /** 该分区还没内容时 */
      empty: string;
      /** 读取失败时；`{error}` 是具体错误 */
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
      /** 指向内容仓库的链接文案 */
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
  description: "个人主页与日记 —— 由 Next.js 与 GitHub Issues 驱动。",

  author: {
    name: "liwenka1",
    email: "",
    links: [{ label: "GitHub", href: "https://github.com/liwenka1" }],
  },

  repo: {
    owner: "liwenka1",
    name: "speak-mind",
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
      description: "关于 {name}",
      lead: "这里是「关于」页的占位内容 —— 可以写你是谁、在做什么、为什么写这个站点。",
      paragraphs: [
        "本站用 Next.js 搭建，内容直接以 GitHub Issues 作为数据源：给 issue 打上对应分区的标签，它就会出现在相应页面里。",
      ],
    },

    section: {
      description: "{name} 的{title}",
      hint: "来自 GitHub Issues —— 打了 {label} 标签的内容会出现在这里。",
      empty: "这里还是空的。去 GitHub 新建一个带 {label} 标签的 issue 试试吧。",
      error: "暂时读不到内容：{error}",
    },

    entry: {
      error: "暂时读不到这篇内容：{error}",
      emptyBody: "（无正文）",
      viewOnGitHub: "在 GitHub 查看 →",
    },

    footer: {
      copyright: "© {year} {name}",
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

/** 内容仓库地址（页脚的「源码」链接用） */
export function repoUrl(): string {
  const { owner, name } = siteConfig.repo;
  return `https://github.com/${owner}/${name}`;
}

/** 作者外链：配了邮箱就自动补一条 mailto，省得在页面上写死 */
export function authorLinks(): SiteLink[] {
  const { email, links } = siteConfig.author;
  return email ? [...links, { label: "邮箱", href: `mailto:${email}` }] : links;
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
