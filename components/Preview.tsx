import { useEffect, useRef } from 'react'
import { PARAMS } from '../utils/constants'

interface PreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  images: { upper: HTMLImageElement | null; lower: HTMLImageElement | null }
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
        let frame = 0
        let lastTime = 0

        const animate = (currentTime: number) => {
          if (!lastTime) lastTime = currentTime
          const deltaTime = currentTime - lastTime

          if (deltaTime >= PARAMS.frameDelay / speed) {
            drawFrame(ctx, images.upper!, images.lower!, frame, resolution, bgColor)
            frame = (frame + 1) % PARAMS.frameCount
            lastTime = currentTime
          }

          animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)
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

function drawFrame(ctx: CanvasRenderingContext2D, upperImg: HTMLImageElement, lowerImg: HTMLImageElement, frameIndex: number, size: number, bgColor: string) {
  // Implementation of drawFrame function (same as in the original code)
  // ...
}

