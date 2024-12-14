import GifGenerator from '../components/GifGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg p-6">
        <GifGenerator />
      </div>
    </main>
  )
}

