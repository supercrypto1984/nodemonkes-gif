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
        const upperImg = new Image()
        const lowerImg = new Image()
      
        upperImg.onload = () => {
          lowerImg.onload = () => {
            // 两张图片都加载完成后，开始动画
            const animate = () => {
              // 动画逻辑（保持原有的占位符逻辑）
              ctx.fillStyle = bgColor
              ctx.fillRect(0, 0, resolution, resolution)
              ctx.drawImage(upperImg, 0, 0, resolution, resolution)
              ctx.drawImage(lowerImg, 0, 0, resolution, resolution)
              animationRef.current = requestAnimationFrame(animate)
            }
            animate()
          }
          lowerImg.src = images.lower
        }
        upperImg.src = images.upper

        upperImg.onerror = () => console.error('Failed to load upper body image')
        lowerImg.onerror = () => console.error('Failed to load lower body image')
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

