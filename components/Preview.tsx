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
    if (!canvasRef.current || !images.upper || !images.lower) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      return
    }

    const upperImg = new Image()
    const lowerImg = new Image()
    
    let imagesLoaded = 0
    const totalImages = 2

    const onImageLoad = () => {
      imagesLoaded++
      if (imagesLoaded === totalImages) {
        const animate = () => {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, resolution, resolution)
          ctx.drawImage(upperImg, 0, 0, resolution, resolution)
          ctx.drawImage(lowerImg, 0, 0, resolution, resolution)
          animationRef.current = requestAnimationFrame(animate)
        }
        animate()
      }
    }

    upperImg.onload = onImageLoad
    lowerImg.onload = onImageLoad
    
    upperImg.onerror = () => console.error('Failed to load upper body image')
    lowerImg.onerror = () => console.error('Failed to load lower body image')

    upperImg.src = images.upper
    lowerImg.src = images.lower

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

