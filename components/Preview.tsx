"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "../../lib/utils" // Import cn for Tailwind class merging

interface PreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  images: { upper: string | null; lower: string | null }
  bgColor: string
  resolution: number
  speed: number
  mode: "normal" | "santa"
}

// These constants are duplicated from GifGenerator for the animation logic
const FRAME_COUNT = 48 
const BASE_FRAME_DELAY = 1000 / 30

export default function Preview({ canvasRef, images, bgColor, resolution, speed, mode }: PreviewProps) {
  const animationRef = useRef<number>()
  const upperImgRef = useRef<HTMLImageElement | null>(null)
  const lowerImgRef = useRef<HTMLImageElement | null>(null)
  const progressRef = useRef(0)
  const lastTimeRef = useRef(0)

  // 确保 drawFrame 函数在组件外部定义或导入
  // 由于我们无法导入 drawFrame，我们将其定义在组件外部

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current || !images.upper || !images.lower) {
      return
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

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
        progressRef.current = 0
        lastTimeRef.current = 0
        animate()
      }
    }

    const upperImg = new Image()
    upperImg.crossOrigin = "anonymous"
    upperImg.onload = onImageLoad
    upperImg.onerror = () => console.error("Failed to load upper body image")
    upperImg.src = images.upper
    upperImgRef.current = upperImg

    const lowerImg = new Image()
    lowerImg.crossOrigin = "anonymous"
    lowerImg.onload = onImageLoad
    lowerImg.onerror = () => console.error("Failed to load lower body image")
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
      const frameDelay = BASE_FRAME_DELAY / speed

      if (deltaTime >= frameDelay) {
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx && upperImgRef.current && lowerImgRef.current) {
          drawFrame(ctx, upperImgRef.current, lowerImgRef.current, progressRef.current, resolution, bgColor)
          progressRef.current = (progressRef.current + 1 / FRAME_COUNT) % 1
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
  }, [canvasRef, images, bgColor, resolution, speed, mode])

  // ⭐️ Tailwind 样式调整：适配深色模式，使用 flex 居中
  return (
    <div
      className="w-full max-w-[600px] aspect-square mx-auto mt-6 bg-gray-950 border border-gray-700 rounded-lg overflow-hidden"
    >
      <canvas 
        ref={canvasRef} 
        width={resolution} 
        height={resolution} 
        className="w-full h-full"
      />
      {!images.upper && !images.lower && (
        <div
          className="flex items-center justify-center w-full h-full text-gray-500"
        >
          预览区域
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------
// 动画辅助函数 (从 GifGenerator.tsx 复制过来以确保 Preview 独立工作)
// -----------------------------------------------------------

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  progress: number,
  size: number,
  bgColor: string,
) {
  const PARAMS = {
    rotationRange: 0.045,
    pressDownStrength: 50,
    insertionStrength: 30,
    insertionAngle: 0.045,
    squashStrength: 0.12,
  }

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = bgColor || "#ffffff"
  ctx.fillRect(0, 0, size, size)

  // 使用 smoothInterpolation 模拟物理效果
  const rotation = Math.sin(progress * Math.PI * 2) * PARAMS.rotationRange
  const isRaising = rotation < 0

  const pressDownPhase = Math.max(0, Math.sin(progress * Math.PI * 2))
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle
  const compressionFactor = pressDownPhase * PARAMS.squashStrength

  const smoothCompression = easeInOutQuad(compressionFactor)

  // 绘制底部 (Lower Body)
  ctx.save()
  const scaleY = 1 - smoothCompression
  const scaleX = 1 + smoothCompression * 0.2

  ctx.translate(size / 2, size)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-size / 2, -size)
  ctx.drawImage(lowerImg, 0, pressDownOffset, size, size)
  ctx.restore()

  // 绘制顶部 (Upper Body)
  ctx.save()
  if (isRaising) {
    // 上抬动作的旋转和位移
    const raisePivotX = Math.floor((size * 3) / 7)
    const pivotY = size - Math.floor((size * 2) / 9)
    ctx.translate(raisePivotX, pivotY + pressDownOffset)
    ctx.rotate(rotation)
    ctx.translate(-raisePivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset, size, size)
  } else {
    // 插入动作的倾斜和位移
    const pivotX = Math.floor((size * 2) / 7)
    const pivotY = size - Math.floor((size * 2) / 9)
    ctx.translate(pivotX, pivotY + pressDownOffset)
    ctx.rotate(insertionRotation)
    ctx.translate(-pivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset + insertionOffset, size, size)
  }
  ctx.restore()
}
