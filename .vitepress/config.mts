import { defineConfig } from "vitepress";
import { nav } from "./config/nav.mts";
import { sidebar } from "./config/sidebar.mjs";
import timeline from "vitepress-markdown-timeline";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Thinker",
  base: "/docs/",
  description: "A VitePress Site",
  head: [
    ["link", { rel: "icon", href: "/logo.svg" }], //favicon图标设置
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  markdown: {
    lineNumbers: true, // 显示代码块行号
    config: (md) => {
      md.use(timeline);
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav,
    sidebar,
    outline: { level: "deep" },
    outlineTitle: "本篇目录",
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    footer: {
      message: "欢迎来到 Thinker 技术空间站",
      copyright: "Copyright by @Thinker 2024-01-01",
    },
  },
});
