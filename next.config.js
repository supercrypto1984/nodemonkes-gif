/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 静态导出必须保留
  output: 'export',
  
  // 2. 移除 distDir: 'out'，让它默认输出到 'out' (由 actions/configure-pages 默认处理)
  // distDir: 'out', // <--- 移除这一行
  
  // 3. 必须设置 basePath 来匹配 GitHub Pages 的子路径
  basePath: '/nodemonkes-gif', 
  
  // 4. 确保静态导出生成可解析的 HTML 文件路径
  trailingSlash: true, 
};

module.exports = nextConfig;
