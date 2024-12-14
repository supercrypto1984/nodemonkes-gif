import GifGenerator from '../components/GifGenerator'

export default function Home() {
  return (
    <main style={{
      fontFamily: 'Arial, sans-serif',
      margin: '0 auto',
      padding: '20px',
      background: '#f5f5f5',
    }}>
      <GifGenerator />
    </main>
  )
}

