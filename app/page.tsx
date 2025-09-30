import GifGenerator from "../components/GifGenerator"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Nodemonkes GIF Generator</h1>
          <p className="text-xl text-gray-400">Create animated GIFs from your favorite Nodemonkes</p>
        </div>
        <GifGenerator />
      </div>
    </main>
  )
}
