FROM node:18-alpine

WORKDIR /app

# 先复制依赖文件并安装
COPY package*.json ./
RUN npm install --production

# 复制所有源代码
COPY src ./src

# 创建上传目录
RUN mkdir -p uploads

# 验证 database.js 是否存在
RUN ls -la src/config/

EXPOSE 3000

CMD ["npm", "start"]
