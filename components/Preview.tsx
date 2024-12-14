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
        let lastTime = 0
        let frame = 0

        const animate = (currentTime: number) => {
          if (!lastTime) lastTime = currentTime
          const deltaTime = currentTime - lastTime
          
          if (deltaTime >= 50 / speed) {
            drawFrame(ctx, upperImg, lowerImg, frame, resolution, bgColor)
            frame = (frame + 1) % 24
            lastTime = currentTime
          }
          
          animationRef.current = requestAnimationFrame(animate)
        }

        animate(performance.now())
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
    <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
      <canvas 
        ref={canvasRef} 
        width={resolution} 
        height={resolution}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      {!images.upper && !images.lower && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          预览区域
        </div>
      )}
    </div>
  )
}

function drawFrame(ctx: CanvasRenderingContext2D, upperImg: HTMLImageElement, lowerImg: HTMLImageElement, frameIndex: number, size: number, bgColor: string) {
  const PARAMS = {
    frameCount: 24,
    rotationRange: 0.045,
    pressDownStrength: 50,
    insertionStrength: 30,
    insertionAngle: 0.045,
    squashStrength: 0.12
  };

  ctx.clearRect(0, 0, size, size)
  
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)
  
  const progress = frameIndex / PARAMS.frameCount * Math.PI * 2
  const rotation = Math.sin(progress) * PARAMS.rotationRange
  const isRaising = rotation < 0
  
  const pressDownPhase = Math.max(0, Math.sin(progress))
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle
  const compressionFactor = pressDownPhase * PARAMS.squashStrength

  ctx.save()
  const scaleY = 1 - compressionFactor
  const scaleX = 1 + (compressionFactor * 0.2)
  
  ctx.translate(size/2, size)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-size/2, -size)
  ctx.drawImage(lowerImg, 0, pressDownOffset, size, size)
  ctx.restore()

  ctx.save()
  if (isRaising) {
    const raisePivotX = Math.floor(size * 3 / 7)
    const pivotY = size - Math.floor(size * 2 / 9)
    ctx.translate(raisePivotX, pivotY + pressDownOffset)
    ctx.rotate(rotation)
    ctx.translate(-raisePivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset, size, size)
  } else {
    const pivotX = Math.floor(size * 2 / 7)
    const pivotY = size - Math.floor(size * 2 / 9)
    ctx.translate(pivotX, pivotY + pressDownOffset)
    ctx.rotate(insertionRotation)
    ctx.translate(-pivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset + insertionOffset, size, size)
  }
  ctx.restore()
}

