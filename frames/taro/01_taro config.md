# taro config

[官网：配置文件](https://taro-docs.jd.com/docs/next/config)

```js
const config = {
  // 项目名称
  projectName: "Awesome Next",
  // 项目创建日期
  date: "2020-6-2",
  // 设计稿尺寸
  designWidth: 750,
  // 设计稿尺寸换算规则
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  // 项目源码目录
  sourceRoot: "src",
  // 项目产出目录
  outputRoot: "dist",
  // Taro 插件配置
  plugins: [],
  // 全局变量设置
  defineConstants: {},
  // 文件 copy 配置 (图片资源不需要编译的，直接拷贝到打包文件中)
  copy: {
    patterns: [],
    options: {},
  },
  // 框架，react，nerv，vue, vue3 等
  framework: "react",
  // 小程序端专用配置
  mini: {
    postcss: {
      autoprefixer: {
        enable: true,
      },
      // 小程序端样式引用本地资源内联配置
      url: {
        enable: true,
        config: {
          limit: 10240,
        },
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: "module", // 转换模式，取值为 global/module
          generateScopedName: "[name]__[local]___[hash:base64:5]",
        },
      },
    },
    // 自定义 Webpack 配置
    webpackChain(chain, webpack) {},
  },
  // H5 端专用配置
  h5: {
    publicPath: "/",
    staticDirectory: "static",
    postcss: {
      autoprefixer: {
        enable: true,
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: "module", // 转换模式，取值为 global/module
          generateScopedName: "[name]__[local]___[hash:base64:5]",
        },
      },
    },
    // 自定义 Webpack 配置
    webpackChain(chain, webpack) {},
    devServer: {},
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === "development") {
    return merge({}, config, require("./dev"));
  }
  return merge({}, config, require("./prod"));
};
```
