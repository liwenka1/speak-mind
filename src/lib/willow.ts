import type { WillowConfig } from "@/config/willow";

/**
 * 首页的柳枝背景：一张铺满视口的 canvas，分两个阶段 ——
 *
 * 1. **生长**：先随机算好整棵的形状（主枝 → 柳条 → 叶子），再按时间一点点"露"出来：
 *    主枝长到哪儿，那儿的柳条才开始往下垂；柳条长过哪一节，那一节的叶子才展开。
 *    整条生长时间轴会被拉伸到 `growTime` 秒，所以换屏幕尺寸、换形状都是这么久。
 * 2. **摇摆**：形状不再变。每帧按风给每一节加一个偏转角，从根部往梢头一节节接着画，
 *    越往梢头偏得越多；梢头的风还晚到一点，摆起来就是一道波顺着柳条往下走。
 *
 * 只依赖 DOM、不依赖 React：组件负责挂上 canvas、切换主题时 `setColor`、卸载时 `destroy`。
 * 手感相关的数都在 `src/config/willow.ts`；这里的常数只管形状细节，一般不用动。
 *
 * 系统开了「减少动态效果」时不播动画，直接画长好的样子（不摇）。
 */

/* ================= 形状细节 ================= */

/** 主枝每一节的长度（px） */
const STEP_B = 6;
/** 柳条每一节的长度（px） */
const STEP_T = 5;
/** 一片叶子从无到有用多久（生长时间轴上的秒，跟着 growTime 一起缩放） */
const LEAF_POP = 0.8;
/** 风从柳条根部传到梢头的延迟（s）—— 有了它，柳条摆起来才是一道波往下走 */
const TWIG_LAG = 0.9;
/** 风力为 1 时，梢头那几节最多偏多少弧度 */
const BASE_AMP = 0.24;
/** canvas 最多按 2 倍分辨率画：再高肉眼看不出差别，只是更费 */
const MAX_DPR = 2;

const TAU = Math.PI * 2;
/** canvas 的 y 轴朝下，π/2 就是正下方 */
const DOWN = Math.PI / 2;

/* ================= 数据结构 ================= */

/** 会"长"的东西（主枝、柳条）共有的生长信息 */
type Growth = {
  /** 总长（px） */
  len: number;
  /** 开始长的时刻（生长时间轴上的秒） */
  birth: number;
  /** 从开始到长完要多久 */
  dur: number;
  /** ease-out 的指数：越大越"先快后慢" */
  ease: number;
};

/** 主枝（或侧枝）：一串等长的节，每节一个角度 */
type Branch = Growth & {
  /** 侧枝长在哪根主枝上（主枝为 null） */
  parent: Branch | null;
  /** 侧枝长在父枝的第几个节点上 */
  node: number;
  /** 主枝的根（侧枝的根每帧取父枝的节点） */
  x: number;
  y: number;
  /** 往右长为 1，往左长为 -1 */
  dir: 1 | -1;
  /** 节数 */
  n: number;
  /** 每一节静止时的角度 */
  angles: Float32Array;
  /** 每帧算出来的节点位置（n + 1 个） */
  px: Float32Array;
  py: Float32Array;
  /** 根部、梢头的线宽 */
  w0: number;
  w1: number;
  /** 有风时轻轻上下点头：幅度、频率、相位 */
  bobAmp: number;
  bobFreq: number;
  bobPhase: number;
};

type Leaf = {
  /** 长在柳条的第几个节点上 */
  i: number;
  /** 在柳条的哪一边 */
  side: 1 | -1;
  /** 和柳条张开的角度 */
  spread: number;
  /** 长度（px） */
  len: number;
  /** 宽长比 */
  wr: number;
  /** 什么时候开始展开（生长时间轴上的秒） */
  birth: number;
  /** 自己抖动的频率、相位 */
  freq: number;
  phase: number;
};

/** 柳条：先顺着主枝斜出去，很快就垂直挂下来 */
type Twig = Growth & {
  parent: Branch;
  /** 长在主枝的第几个节点上 */
  node: number;
  n: number;
  angles: Float32Array;
  /** 每一节有多"软"：越往梢头越大，摆得越多 */
  soft: Float32Array;
  px: Float32Array;
  py: Float32Array;
  /** 每帧算出来的：每一节被风吹偏的角度、吹到它的风 */
  off: Float32Array;
  gust: Float32Array;
  w0: number;
  w1: number;
  /** 这根柳条自己的脾性：多软、风晚到多久、自己晃的频率和相位 */
  flex: number;
  lag: number;
  freq: number;
  phase: number;
  leaves: Leaf[];
};

type Scene = {
  branches: Branch[];
  twigs: Twig[];
  /** 整棵长完是生长时间轴上的第几秒（还没按 growTime 拉伸） */
  growEnd: number;
};

/** 生成一根主枝要的参数 */
type BranchSeed = {
  x: number;
  y: number;
  dir: 1 | -1;
  /** 起始角度：相对"水平朝前"，正 = 往下 */
  rel: number;
  len: number;
  width: number;
  delay: number;
};

export type Willow = {
  /** 换颜色（切换日夜模式时调用） */
  setColor: (color: string) => void;
  /** 停掉动画、解绑事件（组件卸载时调用） */
  destroy: () => void;
};

/* ================= 小工具 ================= */

/** 带种子的随机数：同一个种子长出同一棵，改窗口尺寸时可以按原样重排 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** smoothstep：起风时摆幅慢慢加大，起头和收尾都是缓的 */
function smooth(v: number) {
  const u = clamp01(v);
  return u * u * (3 - 2 * u);
}

/** 叶子展开时稍微冲过头一点再回来，显得有生气 */
function easeOutBack(u: number) {
  return 1 + 2.2 * (u - 1) ** 3 + 1.2 * (u - 1) ** 2;
}

/** 到第 t 秒长出了多长：ease-out，先快后慢 */
function visibleLength(e: Growth, t: number) {
  const u = clamp01((t - e.birth) / e.dur);
  return e.len * (1 - (1 - u) ** e.ease);
}

/** 反过来：长到弧长 s 是第几秒 —— 柳条、叶子在"长到它那儿"时才出现 */
function timeAt(e: Growth, s: number) {
  const p = clamp01(s / e.len);
  return e.birth + e.dur * (1 - (1 - p) ** (1 / e.ease));
}

/**
 * 风：几道正弦叠起来，相位随 x 往后挪 —— 风是一阵一阵从左往右扫过去的；
 * gust 让风时大时小。整体加 0.35：柳条平均略往右偏，像风从左边来。
 */
function windAt(x: number, t: number) {
  const base =
    0.5 * Math.sin(0.55 * t - 0.0022 * x) +
    0.3 * Math.sin(0.93 * t - 0.0041 * x + 1.7) +
    0.2 * Math.sin(1.71 * t - 0.0063 * x + 4.1);
  const gust = 0.6 + 0.4 * Math.sin(0.19 * t - 0.0009 * x + 0.5);
  return (0.35 + base) * gust;
}

/* ================= 入口 ================= */

/**
 * 在 canvas 上长一棵柳树。canvas 的显示尺寸由 CSS 决定（铺满视口），
 * 这里按它的实际尺寸和屏幕倍率设置画布分辨率。
 */
export function startWillow(
  canvas: HTMLCanvasElement,
  config: WillowConfig,
): Willow {
  const context = canvas.getContext("2d");
  if (!context) return { setColor: () => {}, destroy: () => {} };
  const ctx = context;

  // 配置里的数先兜个底：写成 0 或负数也不至于卡死、除以零
  const growTime = Math.max(0.1, config.growTime);
  const windRamp = Math.max(0.01, config.windRamp);
  const gapScale = 1 / Math.max(0.1, config.density);
  const alpha = clamp01(config.opacity);
  const frameGap = 1000 / Math.max(1, config.swayFps);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seed = (Math.random() * 2 ** 31) >>> 0;

  let rnd = mulberry32(seed);
  const R = (a: number, b: number) => a + (b - a) * rnd();

  let color = config.color.light;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let scene: Scene;
  /** 时间轴（s）：生长阶段按 growTime 换算快慢，长完以后就是真实时间 */
  let clock = 0;
  let lastMs = 0;
  let lastDraw = 0;
  let raf = 0;
  let resizeTimer = 0;
  // 画带状枝条用的临时数组（长度按最长的那根分配）
  let XS = new Float32Array(0);
  let YS = new Float32Array(0);
  let NX = new Float32Array(0);
  let NY = new Float32Array(0);

  /* ---------- 生成：一次算好整棵的形状 ---------- */

  function build(): Scene {
    rnd = mulberry32(seed);
    if (W < 1 || H < 1) return { branches: [], twigs: [], growEnd: 0 };

    const branches: Branch[] = [];
    const twigs: Twig[] = [];
    const narrow = W < 700;
    const count = W >= 1100 ? 4 : W >= 700 ? 3 : 2;

    for (let k = 0; k < count; k++) {
      // 前两根一左一右，保证两边都有；多出来的从顶上斜着伸进来
      const dir: 1 | -1 = k === 0 ? 1 : k === 1 ? -1 : rnd() < 0.5 ? 1 : -1;
      const fromSide = k < 2 || rnd() < 0.3;
      const shape = fromSide
        ? {
            x: dir > 0 ? -30 : W + 30,
            y: H * R(-0.02, 0.16),
            rel: R(-0.4, -0.05),
            len: W * R(0.36, 0.56) * (narrow ? 1.3 : 1),
          }
        : {
            x: dir > 0 ? W * R(0.02, 0.3) : W * R(0.7, 0.98),
            y: R(-70, -25),
            rel: R(-0.05, 0.15),
            len: W * R(0.22, 0.38),
          };
      addBranch({ ...shape, dir, width: 2.4, delay: R(0, 0.6) }, null, 0, branches);
    }
    for (const b of branches) sprout(b, twigs, narrow);

    let growEnd = 0;
    let maxN = 0;
    for (const e of [...branches, ...twigs]) {
      growEnd = Math.max(growEnd, e.birth + e.dur);
      maxN = Math.max(maxN, e.n);
    }
    XS = new Float32Array(maxN + 2);
    YS = new Float32Array(maxN + 2);
    NX = new Float32Array(maxN + 2);
    NY = new Float32Array(maxN + 2);
    return { branches, twigs, growEnd: growEnd + LEAF_POP };
  }

  /** 主枝：从屏幕边上伸进来，先略往上翘、再慢慢往下坠成一道弧；偶尔分出一两根侧枝 */
  function addBranch(
    o: BranchSeed,
    parent: Branch | null,
    node: number,
    out: Branch[],
  ) {
    const n = Math.max(3, Math.round(o.len / STEP_B));
    const angles = new Float32Array(n);
    const sag = R(0.002, 0.004);
    let rel = o.rel;
    let curl = 0;
    for (let i = 0; i < n; i++) {
      curl = curl * 0.85 + R(-0.02, 0.02);
      rel = Math.min(0.75, Math.max(-0.55, rel + sag + curl));
      angles[i] = o.dir > 0 ? rel : Math.PI - rel;
    }
    const b: Branch = {
      parent,
      node,
      x: o.x,
      y: o.y,
      dir: o.dir,
      n,
      len: n * STEP_B,
      angles,
      px: new Float32Array(n + 1),
      py: new Float32Array(n + 1),
      w0: o.width,
      w1: 0.5,
      ease: 1.4,
      birth: o.delay,
      dur: 1.2 + (n * STEP_B) / 300,
      bobAmp: R(0.04, 0.08),
      bobFreq: R(0.45, 0.8),
      bobPhase: R(0, TAU),
    };
    // 先按静止的样子排一遍：侧枝和柳条要知道自己的根在哪儿
    layoutBranch(b, 0, 0);
    out.push(b);
    if (parent) return;

    const subs = rnd() < 0.65 ? (rnd() < 0.35 ? 2 : 1) : 0;
    for (let s = 0; s < subs; s++) {
      const at = Math.floor(n * R(0.2, 0.65));
      const baseRel = o.dir > 0 ? angles[at] : Math.PI - angles[at];
      // 侧枝多半往上挑
      const fork = rnd() < 0.6 ? -R(0.25, 0.55) : R(0.2, 0.4);
      addBranch(
        {
          x: 0,
          y: 0,
          dir: o.dir,
          rel: baseRel + fork,
          len: (n - at) * STEP_B * R(0.35, 0.6),
          width: 1.5,
          delay: timeAt(b, at * STEP_B),
        },
        b,
        at,
        out,
      );
    }
  }

  /** 沿主枝每隔一段垂下一根柳条：越靠屏幕两边越长、中间越短，给正文留出空 */
  function sprout(b: Branch, out: Twig[], narrow: boolean) {
    for (
      let s = b.len * R(0.04, 0.1);
      s < b.len * 0.98;
      s += R(15, 32) * gapScale
    ) {
      const node = Math.min(b.n, Math.round(s / STEP_B));
      const rx = b.px[node];
      const ry = b.py[node];
      if (rx < -40 || rx > W + 40 || ry > H * 0.55) continue;
      const edge = Math.min(1, Math.abs(rx / W - 0.5) * 2);
      let f =
        (0.15 + 0.52 * edge ** 1.25) *
        R(0.55, 1.15) *
        (narrow ? 0.8 : 1) *
        config.length;
      // 偶尔一根特别长的
      if (rnd() < 0.07) f *= 1.35;
      const len = Math.min(H * 0.92, H * f) + Math.max(0, -ry);
      const a0 = b.angles[Math.min(node, b.n - 1)] + b.dir * R(0.35, 0.9);
      addTwig(b, node, a0, len, timeAt(b, s) + R(0.1, 0.7), out);
    }
  }

  /** 柳条：先顺着主枝的方向斜出去，每一节都往正下方拐一点，很快就垂直挂下来 */
  function addTwig(
    parent: Branch,
    node: number,
    a0: number,
    len: number,
    birth: number,
    out: Twig[],
  ) {
    const n = Math.max(4, Math.round(len / STEP_T));
    const angles = new Float32Array(n);
    const soft = new Float32Array(n);
    const g = R(0.05, 0.09);
    let a = a0;
    let curl = 0;
    for (let i = 0; i < n; i++) {
      curl = curl * 0.9 + R(-0.012, 0.012);
      a += (DOWN - a) * g + curl;
      angles[i] = a;
      soft[i] = ((i + 1) / n) ** 1.5;
    }
    const tw: Twig = {
      parent,
      node,
      n,
      len: n * STEP_T,
      angles,
      soft,
      px: new Float32Array(n + 1),
      py: new Float32Array(n + 1),
      off: new Float32Array(n),
      gust: new Float32Array(n),
      w0: R(0.9, 1.25),
      w1: 0.3,
      ease: 1.5,
      birth,
      // 时长随长度的 0.7 次方增长：长柳条长得快些，不至于拖太久
      dur: 1.2 * ((n * STEP_T) / 100) ** 0.7 * R(0.85, 1.15),
      flex: R(0.7, 1.3),
      lag: R(0, 0.5),
      freq: R(0.6, 1.3),
      phase: R(0, TAU),
      leaves: [],
    };
    // 叶子左右交替；中段最大，梢头的小；偶尔空一片
    let side: 1 | -1 = rnd() < 0.5 ? 1 : -1;
    for (
      let i = Math.max(2, Math.round(n * R(0.06, 0.12)));
      i <= n;
      i += Math.max(2, Math.round(R(8, 13) / STEP_T))
    ) {
      side = side > 0 ? -1 : 1;
      if (rnd() > 0.85) continue;
      const u = i / n;
      const size = 0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.05));
      tw.leaves.push({
        i,
        side,
        spread: R(0.3, 0.6),
        len: R(8, 13) * size,
        wr: R(0.17, 0.24),
        birth: timeAt(tw, i * STEP_T),
        freq: R(2.5, 5),
        phase: R(0, TAU),
      });
    }
    out.push(tw);
  }

  /* ---------- 每帧：按当前的风算出每一节的位置 ---------- */

  /** 主枝基本不动，有风时只轻轻上下点头 */
  function layoutBranch(b: Branch, wt: number, amp: number) {
    let x = b.parent ? b.parent.px[b.node] : b.x;
    let y = b.parent ? b.parent.py[b.node] : b.y;
    b.px[0] = x;
    b.py[0] = y;
    const bob = amp * b.bobAmp * Math.sin(wt * b.bobFreq + b.bobPhase);
    for (let i = 0; i < b.n; i++) {
      const a = b.angles[i] + bob * ((i + 1) / b.n);
      x += Math.cos(a) * STEP_B;
      y += Math.sin(a) * STEP_B;
      b.px[i + 1] = x;
      b.py[i + 1] = y;
    }
  }

  /**
   * 柳条：根钉在主枝上；每一节在原来的角度上加一个偏转，越往梢头偏得越多，
   * 而且越往梢头风来得越晚。只算到第 segs 节（生长中只露出这么多）。
   */
  function layoutTwig(tw: Twig, wt: number, amp: number, segs: number) {
    let x = tw.parent.px[tw.node];
    let y = tw.parent.py[tw.node];
    const rootX = x;
    tw.px[0] = x;
    tw.py[0] = y;
    for (let i = 0; i < segs; i++) {
      let off = 0;
      if (amp > 0) {
        const tt = wt - ((i + 1) / tw.n) * TWIG_LAG - tw.lag;
        const w = windAt(rootX, tt);
        tw.gust[i] = w;
        // 风往右吹，下垂的柳条就往右偏（角度变小）；再加一点它自己的晃动
        off =
          -amp *
          tw.flex *
          (w + 0.3 * Math.sin(tt * tw.freq + tw.phase)) *
          tw.soft[i];
      }
      tw.off[i] = off;
      const a = tw.angles[i] + off;
      x += Math.cos(a) * STEP_T;
      y += Math.sin(a) * STEP_T;
      tw.px[i + 1] = x;
      tw.py[i + 1] = y;
    }
  }

  /* ---------- 画 ---------- */

  /** 把看得见的那一截拷进 XS/YS，最后一节按比例截断（正在长的梢头） */
  function collect(e: Branch | Twig, step: number, vis: number) {
    const full = vis / step;
    const m = Math.min(e.n, Math.floor(full));
    for (let k = 0; k <= m; k++) {
      XS[k] = e.px[k];
      YS[k] = e.py[k];
    }
    let cnt = m + 1;
    const frac = full - m;
    if (m < e.n && frac > 1e-3) {
      XS[cnt] = e.px[m] + (e.px[m + 1] - e.px[m]) * frac;
      YS[cnt] = e.py[m] + (e.py[m + 1] - e.py[m]) * frac;
      cnt++;
    }
    return cnt;
  }

  /**
   * 沿法线往两边各让出半个线宽，围成一条由粗到细的带子。
   * 整根一次 fill：叠在一起的地方不会因为半透明而一节节发黑。
   */
  function ribbon(cnt: number, n: number, w0: number, w1: number, sharp: boolean) {
    if (cnt < 2) return;
    for (let k = 0; k < cnt; k++) {
      const k0 = k > 0 ? k - 1 : 0;
      const k1 = k < cnt - 1 ? k + 1 : cnt - 1;
      const dx = XS[k1] - XS[k0];
      const dy = YS[k1] - YS[k0];
      const d = Math.hypot(dx, dy) || 1;
      let hw = (w0 + (w1 - w0) * (k / n)) / 2;
      // 正在长的主枝，梢头收尖
      if (sharp) hw *= Math.min(1, 0.25 + (cnt - 1 - k) / 10);
      NX[k] = (-dy / d) * hw;
      NY[k] = (dx / d) * hw;
      if (k === 0) ctx.moveTo(XS[0] + NX[0], YS[0] + NY[0]);
      else ctx.lineTo(XS[k] + NX[k], YS[k] + NY[k]);
    }
    for (let k = cnt - 1; k >= 0; k--) ctx.lineTo(XS[k] - NX[k], YS[k] - NY[k]);
    ctx.closePath();
  }

  /**
   * 柳叶：细长的柳叶形，两段二次曲线围成。绕的方向和枝条的带子一致，
   * 所以能和柳条合进同一次 fill（方向不一致的话，重叠处会被抵消成镂空）。
   */
  function drawLeaves(tw: Twig, t: number, wt: number, amp: number, vis: number) {
    const reach = vis / STEP_T;
    for (const lf of tw.leaves) {
      if (lf.i > reach) break;
      const age = (t - lf.birth) / LEAF_POP;
      if (age <= 0) continue;
      const L = lf.len * (age >= 1 ? 1 : easeOutBack(age));
      if (L < 0.6) continue;
      const seg = lf.i - 1;
      let a = tw.angles[seg] + tw.off[seg] + lf.side * lf.spread;
      // 叶子自己再抖一抖：风越大抖得越明显
      if (amp > 0) {
        a +=
          amp *
          (0.25 + 0.6 * Math.abs(tw.gust[seg])) *
          Math.sin(wt * lf.freq + lf.phase);
      }
      const cx = Math.cos(a);
      const cy = Math.sin(a);
      const bx = tw.px[lf.i];
      const by = tw.py[lf.i];
      const mx = bx + cx * L * 0.45;
      const my = by + cy * L * 0.45;
      const hw = L * lf.wr;
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(mx - cy * hw, my + cx * hw, bx + cx * L, by + cy * L);
      ctx.quadraticCurveTo(mx + cy * hw, my - cx * hw, bx, by);
    }
  }

  /** 画第 t 秒的样子；still 为 true 时没有风 */
  function render(t: number, still: boolean) {
    // 长完之前没有风；长完停 growPause 秒，风在 windRamp 秒里慢慢起来
    const ramp = still
      ? 0
      : smooth((t - scene.growEnd - config.growPause) / windRamp);
    const amp = BASE_AMP * config.wind * ramp;
    // 风自己的时间轴：windSpeed 越大摆得越急
    const wt = t * config.windSpeed;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    for (const b of scene.branches) {
      layoutBranch(b, wt, amp);
      const vis = visibleLength(b, t);
      if (vis <= 0) continue;
      ctx.beginPath();
      ribbon(collect(b, STEP_B, vis), b.n, b.w0, b.w1, vis < b.len);
      ctx.fill();
    }
    for (const tw of scene.twigs) {
      const vis = visibleLength(tw, t);
      if (vis <= 0) continue;
      layoutTwig(tw, wt, amp, Math.min(tw.n, Math.ceil(vis / STEP_T)));
      ctx.beginPath();
      ribbon(collect(tw, STEP_T, vis), tw.n, tw.w0, tw.w1, false);
      drawLeaves(tw, t, wt, amp, vis);
      ctx.fill();
    }
  }

  /* ---------- 播放 ---------- */

  const animated = () => !reduceMotion.matches;

  function frame(ms: number) {
    raf = window.requestAnimationFrame(frame);
    const dt = Math.min(0.1, Math.max(0, (ms - lastMs) / 1000));
    lastMs = ms;
    // 生长阶段：把整棵的生长时间轴拉伸到 growTime 秒；长完以后按真实时间走，风的快慢不受影响
    const growing = clock < scene.growEnd;
    clock += growing ? dt * (scene.growEnd / growTime) : dt;
    // 生长阶段跑满帧；摇摆阶段限到 swayFps
    if (!growing && ms - lastDraw < frameGap - 2) return;
    lastDraw = ms;
    render(clock, false);
  }

  function start() {
    window.cancelAnimationFrame(raf);
    // 切回标签页时从这里接着走，不会一下跳到长完
    lastMs = performance.now();
    raf = animated() && !document.hidden ? window.requestAnimationFrame(frame) : 0;
  }

  function stop() {
    window.cancelAnimationFrame(raf);
    raf = 0;
  }

  /** 不播动画时：直接画长好的样子，不摇 */
  function drawStill() {
    render(scene.growEnd + 1, true);
  }

  function redraw() {
    if (animated()) render(clock, false);
    else drawStill();
  }

  function measure() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const oldW = W;
      const oldH = H;
      measure();
      // 只是手机地址栏伸缩（高度小变）：形状不动，接着画；尺寸真变了才按新尺寸重排
      if (Math.abs(W - oldW) >= 1 || Math.abs(H - oldH) >= 120) {
        // 同一个种子按新尺寸重排；已经长完的直接摆，不重播生长
        const grown = clock >= scene.growEnd;
        scene = build();
        clock = grown ? scene.growEnd + config.growPause + windRamp : 0;
      }
      redraw();
    }, 150);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function onMotionChange() {
    if (animated()) {
      start();
    } else {
      stop();
      drawStill();
    }
  }

  measure();
  scene = build();
  if (animated()) start();
  else drawStill();

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", onMotionChange);

  return {
    setColor(next) {
      if (next === color) return;
      color = next;
      redraw();
    },
    destroy() {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionChange);
    },
  };
}
