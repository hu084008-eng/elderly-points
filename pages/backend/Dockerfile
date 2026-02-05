FROM node:18-alpine

WORKDIR /app

# 强制刷新缓存 - 2024-02-05
COPY package*.json ./
RUN npm install --production

# 复制所有源代码
COPY src ./src

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
