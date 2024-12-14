import { useEffect, useRef } from 'react'

interface PreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  images: { upper: string | null; lower: string | null }
  bgColor: string
  resolution: number
  speed: number
}

export default function Preview({ canvasRef, images, bgColor, resolution, speed }: PreviewProps) {
  const animationRef = useRef<number>()

  useEffect(() => {
    if (canvasRef.current && images.upper && images.lower) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        // Placeholder for animation logic
        const animate = () => {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, resolution, resolution)
          // Draw placeholder images
          ctx.fillStyle = 'black'
          ctx.font = '20px Arial'
          ctx.fillText('Preview Placeholder', resolution / 2 - 80, resolution / 2)
          animationRef.current = requestAnimationFrame(animate)
        }
        animate()
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvasRef, images, bgColor, resolution, speed])

  return (
    <div className="w-full aspect-square bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} width={resolution} height={resolution} />
    </div>
  )
}

