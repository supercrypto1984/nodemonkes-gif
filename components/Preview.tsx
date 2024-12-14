'use client'

import { useEffect, useRef } from 'react'

interface PreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  images: { upper: string | null; lower: string | null }
  bgColor: string
  resolution: number
  speed: number
}

const PARAMS = {
  frameCount: 24,
  frameDelay: 50,
  rotationRange: 0.045,
  pressDownStrength: 50,
  insertionStrength: 30,
  insertionAngle: 0.045,
  squashStrength: 0.12
}

export default function Preview({ canvasRef, images, bgColor, resolution, speed }: PreviewProps) {
  const animationRef = useRef<number>()
  const upperImgRef = useRef<HTMLImageElement | null>(null)
  const lowerImgRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current || !images.upper || !images.lower) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvasRef.current.width = resolution
    canvasRef.current.height = resolution

    let imagesLoaded = 0
    const totalImages = 2

    const onImageLoad = () => {
      imagesLoaded++
      if (imagesLoaded === totalImages) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        frameRef.current = 0
        lastTimeRef.current = 0
        animate()
      }
    }

    // Load upper image
    const upperImg = new Image()
    upperImg.crossOrigin = 'anonymous'
    upperImg.onload = onImageLoad
    upperImg.onerror = () => console.error('Failed to load upper body image')
    upperImg.src = images.upper
    upperImgRef.current = upperImg

    // Load lower image
    const lowerImg = new Image()
    lowerImg.crossOrigin = 'anonymous'
    lowerImg.onload = onImageLoad
    lowerImg.onerror = () => console.error('Failed to load lower body image')
    lowerImg.src = images.lower
    lowerImgRef.current = lowerImg

    function animate(currentTime?: number) {
      if (!currentTime) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = currentTime - lastTimeRef.current
      
      if (deltaTime >= PARAMS.frameDelay / speed) {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx && upperImgRef.current && lowerImgRef.current) {
          drawFrame(
            ctx,
            upperImgRef.current,
            lowerImgRef.current,
            frameRef.current,
            resolution,
            bgColor
          )
          frameRef.current = (frameRef.current + 1) % PARAMS.frameCount
          lastTimeRef.current = currentTime
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvasRef, images, bgColor, resolution, speed])

  return (
    <div className="preview relative aspect-square w-full max-w-[600px] mx-auto bg-white rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
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

function drawFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  frameIndex: number,
  size: number,
  bgColor: string
) {
  ctx.clearRect(0, 0, size, size)
  
  ctx.fillStyle = bgColor || '#ffffff'
  ctx.fillRect(0, 0, size, size)
  
  const progress = frameIndex / PARAMS.frameCount * Math.PI * 2
  const rotation = Math.sin(progress) * PARAMS.rotationRange
  const isRaising = rotation < 0
  
  const pressDownPhase = Math.max(0, Math.sin(progress))
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle
  const compressionFactor = pressDownPhase * PARAMS.squashStrength

  // Draw lower body with compression
  ctx.save()
  const scaleY = 1 - compressionFactor
  const scaleX = 1 + (compressionFactor * 0.2)
  
  ctx.translate(size/2, size)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-size/2, -size)
  ctx.drawImage(lowerImg, 0, pressDownOffset, size, size)
  ctx.restore()

  // Draw upper body with rotation
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

