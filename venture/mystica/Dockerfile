# Mystica — 生产镜像 (适用于 Railway / Render / Fly.io / 任意容器平台)
FROM node:20-slim

WORKDIR /app

# 先装依赖 (利用 Docker 缓存层)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# 拷贝源码
COPY . .

# 生成 144 个 SEO 落地页 + sitemap (可选, 失败不阻断构建)
RUN node build-seo.js || true

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
