/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/nodemonkes-gif', 
  
  // ⭐️ 关键修复：确保静态导出时生成正确的目录和文件结构
  trailingSlash: true, 
};

module.exports = nextConfig;
