/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    
    // ⭐️ 关键修复：当使用自定义域名时，必须设为空字符串
    basePath: "", 
    assetPrefix: "", // 移除 assetPrefix，让资源从根目录加载
    
    distDir: "out",
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
