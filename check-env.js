#!/usr/bin/env node

/**
 * 环境检查脚本
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  环境检查工具');
console.log('========================================\n');

let hasError = false;

// 检查文件是否存在
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}缺失: ${filePath}`);
    hasError = true;
    return false;
  }
}

// 检查目录是否存在
function checkDir(dirPath, description) {
  const fullPath = path.join(__dirname, dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}`);
    return true;
  } else {
    console.log(`❌ ${description}缺失: ${dirPath}`);
    hasError = true;
    return false;
  }
}

console.log('📁 检查项目结构...\n');

// 后端文件
checkDir('backend', '后端目录');
checkFile('backend/package.json', '后端package.json');
checkFile('backend/Dockerfile', '后端Dockerfile');
checkFile('backend/src/app.js', '后端入口文件');
checkDir('backend/src/routes', '后端路由目录');
checkDir('backend/src/models', '后端模型目录');

console.log('');

// 前端文件
checkDir('frontend', '前端目录');
checkFile('frontend/package.json', '前端package.json');
checkFile('frontend/Dockerfile', '前端Dockerfile');
checkFile('frontend/vite.config.js', '前端配置');
checkFile('frontend/index.html', '前端HTML');
checkDir('frontend/src/views', '前端页面目录');

console.log('');

// 配置文件
checkFile('docker-compose.yml', 'Docker Compose配置');
checkFile('init.sql', '数据库初始化脚本');
checkFile('README.md', 'README文档');

console.log('\n========================================');

if (hasError) {
  console.log('❌ 检查未通过，请修复上述问题');
  process.exit(1);
} else {
  console.log('✅ 所有检查项通过！');
  console.log('\n接下来可以运行：docker-compose up -d --build');
  process.exit(0);
}
