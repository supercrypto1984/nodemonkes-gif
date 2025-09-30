import GifGenerator from "../components/GifGenerator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/*
          确保标题和描述的容器具有 text-center。
          由于标题和描述文字是内联内容，text-center 应该能居中它们。
        */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nodemonkes GIF Generator</h1>
          <p className="text-lg text-gray-600">Create animated GIFs from your favorite Nodemonkes</p>
        </div>
        {/* GifGenerator 组件外部的 flex justify-center 确保了 GIF 生成器部分居中 */}
        <div className="flex justify-center">
            <GifGenerator />
        </div>
      </div>
    </main>
  )
}
