import dynamic from "next/dynamic"

const GifGenerator = dynamic(() => import("../components/GifGenerator"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Loading Nodemonkes GIF Generator...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nodemonkes GIF Generator</h1>
          <p className="text-lg text-gray-600">Create animated GIFs from your favorite Nodemonkes</p>
        </div>
        <GifGenerator />
      </div>
    </main>
  )
}
