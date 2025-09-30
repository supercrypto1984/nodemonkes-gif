import GifGenerator from "../components/GifGenerator"

export default function Home() {
  return (
    // 移除容器样式，让 GifGenerator 组件控制布局
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* 头部区域，保持居中和深色主题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-50 mb-2">Nodemonkes GIF Generator</h1>
          <p className="text-lg text-gray-400">Create animated GIFs from your favorite Nodemonkes</p>
        </div>
        {/* 核心 GIF 生成器组件 */}
        <GifGenerator />
      </div>
    </main>
  )
}
