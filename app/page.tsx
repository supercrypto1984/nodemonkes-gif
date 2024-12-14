import GifGenerator from '../components/GifGenerator'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">GIF生成器</h1>
      <GifGenerator />
    </main>
  )
}

