# sanyu-open-web-demo

三域开放平台的**门户前端**开源演示：接口浏览、文档页、在线调试与用户控制台 UI。

本仓库只包含前端。接口数据默认通过开发代理访问线上服务，本地不必起 Java 后端。

## 快速开始

```bash
# 需要 Node.js 18+
cp .env.example .env.development   # 已有默认可跳过
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:8081`）。

### 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `VITE_PROXY_TARGET` | 开发时 `/api` 代理目标 | `https://www.sanyu366.com` |
| `VITE_PROXY_STRIP_API` | 是否去掉路径前缀 `/api`（仅本地无前缀的后端需要） | `false` |
| `VITE_DEV_PORT` | 开发端口 | `8081` |

对接自建后端时，把 `VITE_PROXY_TARGET` 改成你的 web-api 地址，并按实际路径设置 `VITE_PROXY_STRIP_API`。

## 能做什么

- 浏览已上线开放接口与文档
- 在接口详情页粘贴 Token 做在线调试（`X-Api-Key`）
- 查看控制台相关页面结构（登录后能力依赖后端账号体系）

## Token 从哪来

调试开放接口需要 AccessKey。可在线上控制台创建后粘贴到本仓库的调试面板：

- 控制台与文档：<https://www.sanyu366.com>

本仓库不内置任何真实 Key，也不收集你的凭证。

## 技术栈

Vue 3 · Vite · Element Plus · Pinia · Vue Router · Axios

## 目录

```text
src/
  api/          # 门户与调试请求
  views/        # 首页、探索、文档详情等
  console/      # 用户控制台页面
  components/   # 调试面板、FAQ 等
public/         # 静态资源
deploy/         # Nginx 配置示例（可选）
```

## 构建

```bash
npm run build
npm run preview
```

生产构建产物为静态文件；部署时请将 `/api` 反代到对应后端（可参考 `deploy/nginx-portal.conf.example`）。

## 说明

- 这是**前端演示仓库**，不包含管理端、开放 API 网关或数据库脚本。
- 默认连接线上环境仅为方便本地预览；请遵守服务条款，勿对线上做压力测试。
- 完整接口目录、额度与账号能力以文档站为准。

## License

[MIT](./LICENSE)
