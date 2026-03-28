# 使用Node.js 20作为基础镜像
FROM node:20.10.0-alpine3.19 AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 使用Nginx作为生产服务器
FROM nginx:1.25.3-alpine3.18

# 复制构建产物到Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置（如果需要自定义）
# COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]