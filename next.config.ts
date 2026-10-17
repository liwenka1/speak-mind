import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    「关于」页已删除（首页本身就是自我介绍）：旧地址永久重定向（308）到首页，
    已经分享出去的 /about 链接不会 404。
  */
  redirects() {
    return [{ source: "/about", destination: "/", permanent: true }];
  },
};

export default nextConfig;
