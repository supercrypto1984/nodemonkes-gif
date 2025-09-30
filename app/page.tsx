import GifGenerator from "../components/GifGenerator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/*
          修正标题居中：
          我们添加 w-full 和 max-w-lg (或您认为合适的宽度) 并使用 mx-auto 将这个块级容器居中。
          同时保持 text-center 确保文字在容器内居中。
        */}
        <div className="text-center mb-8 w-full max-w-lg mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nodemonkes GIF Generator</h1>
          <p className="text-lg text-gray-600">Create animated GIFs from your favorite Nodemonkes</p>
        </div>
        
        {/* GifGenerator 组件的居中容器保持不变 */}
        <div className="flex justify-center">
          <GifGenerator />
        </div>
      </div>
    </main>
  )
}
