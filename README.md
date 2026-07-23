# ALCOMD3 官方网站

ALCOMD3 官方网站，基于 [Astro](https://astro.build/) 构建。

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

## 项目结构

```text
/
├── public/
├── src/
│   ├── pages/
│   │   └── index.astro
│   ├── config.ts
│   └── env.d.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 许可证

本项目采用 [GNU Affero General Public License v3.0](./LICENSE) 许可证。

