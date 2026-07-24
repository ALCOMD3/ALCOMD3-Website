# ALCOMD3 官方网站

ALCOMD3 官方网站，基于 [Astro](https://astro.build/) 与
[Material Web](https://material-web.dev/) 构建。

## 环境要求

- Node.js：使用 Astro 当前支持的 Node.js LTS 版本
- npm：随 Node.js 安装

## 本地开发

```shell
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run check` | 执行 Astro 与 TypeScript 检查 |
| `npm run build` | 检查并构建生产版本 |
| `npm run preview` | 本地预览生产构建 |
| `npm run test:unit` | 执行下载清单与主题生成测试 |
| `npm run test:e2e` | 执行浏览器端关键流程测试 |

## 项目结构

```text
/
├── alcomd3.config.json
├── public/
│   ├── api/gui/
│   └── assets/
├── scripts/
│   └── generate-theme.mjs
├── src/
│   ├── components/
│   ├── content/mcp/
│   ├── data/
│   ├── generated/
│   ├── layouts/
│   ├── pages/
│   └── styles/
└── tests/
```

网站提供 `en-US`、`zh-CN`、`zh-TW` 和 `ja-JP` 四种语言。根路径仅负责按浏览器或已保存偏好跳转到对应语言；首页、下载页和 MCP 文档页均为静态生成。

主题令牌由 `alcomd3.config.json` 中的种子色生成。稳定版与测试版下载信息分别读取 `public/api/gui/tauri-updater.json` 和 `public/api/gui/tauri-updater-beta.json`。

## 许可证

本项目采用 [GNU Affero General Public License v3.0](./LICENSE) 许可证。

