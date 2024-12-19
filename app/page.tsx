import GifGenerator from '@/components/GifGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/nodemonkes-gif/nodemonke-logo.png" 
            alt="Nodemonke Logo" 
            className="w-16 h-16 md:w-20 md:h-20"
          />
        </div>
        <GifGenerator />
      </div>
    </main>
  )
}
