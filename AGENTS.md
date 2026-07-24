# AGENTS.md

- 使用简体中文沟通；代码默认缩进为 4 个半角空格。
- 修改前阅读相关代码、配置和文档；更深层目录的 `AGENTS.md` 优先。
- 聚焦当前任务，不覆盖用户改动，不进行无关重构、格式化或依赖升级。
- 未经用户明确许可，不得修改本文件。
- 技术栈为 Astro + Material Web（`@material/web`）。Astro 问题优先查 Astro MCP 或[官方文档](https://docs.astro.build/)；Material Web 和 MD3 问题查[组件文档](https://material-web.dev/)与[设计规范](https://m3.material.io/)。
- Material Web 是组件库而非 CSS 框架：需求匹配时使用 `md-*` 组件，否则使用语义化 HTML、项目组件和自定义 CSS。
- Material Web 组件按需导入，只使用公开的 attributes、properties、events、slots 和 CSS 自定义属性，不依赖 Shadow DOM 内部实现。
- 组件主题使用官方 `--md-ref-*`、`--md-sys-*` 和组件令牌；重复的项目样式值抽取为设计令牌，避免散落硬编码。
- 可参考 Beer CSS 的公开实现完善 MD3 或 Material 3 Expressive 效果，但不得引入其依赖或照搬项目结构；复用代码前确认许可证。
- Astro 默认静态优先，仅为必要交互添加客户端 JavaScript，避免无意义的水合和全局脚本。
- 优先使用 Noto Sans 及其多语言变体，等宽字体使用 Noto Sans Mono；字体必须本地托管，禁止使用 Google Fonts 等 CDN，并配置系统字体回退。
- 避免硬编码域名、公开路径、环境配置和重复文案；沿用项目现有的数据与文件组织，不擅自建立固定目录规则。
- 上线内容、SEO、manifest 和结构化数据默认以 `en-US` 为基准；其他语言设置正确的 `lang` 和文字方向。
- 前端改动须兼顾桌面端、移动端、键盘操作、焦点态、对比度、溢出、加载态、错误态和 `prefers-reduced-motion`。
- 按影响范围运行 `npm.cmd run check`、`npm.cmd run build` 或更聚焦的验证；无法验证时说明原因和风险。
