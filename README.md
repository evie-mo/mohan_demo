# Mohan VLM Dashboard

React + Vite + Tailwind CSS 仪表盘，用于展示 VLM 观测到的工程协作信号。

## 本地运行

在项目根目录 `/Users/MoWanying/Documents/mohan_MVP` 执行：

```bash
npm install
npm run dev
```

然后在浏览器打开终端中显示的本地地址（通常是 `http://localhost:5173`）。

## 部署建议

- **静态部署**：先执行 `npm run build`，会生成 `dist` 目录，把 `dist` 上传到任意静态站点托管（如 Vercel、Netlify、Cloudflare Pages 或 Nginx）。
- **Vercel/Netlify**：
  - Build 命令：`npm run build`
  - Output 目录：`dist`


