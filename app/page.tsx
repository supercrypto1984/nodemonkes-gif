import GifGenerator from "../components/GifGenerator"

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
