"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface PreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  images: { upper: string | null; lower: string | null }
  bgColor: string
  resolution: number
  speed: number
  mode: "normal" | "santa"
}

const FRAME_COUNT = 36
const BASE_FRAME_DELAY = 1000 / 30

export default function Preview({ canvasRef, images, bgColor, resolution, speed, mode }: PreviewProps) {
  const animationRef = useRef<number>()
  const upperImgRef = useRef<HTMLImageElement | null>(null)
  const lowerImgRef = useRef<HTMLImageElement | null>(null)
  const progressRef = useRef(0)
  const lastTimeRef = useRef(0)

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
          drawFrame(ctx, upperImgRef.current, lowerImgRef.current, progressRef.current, resolution, bgColor, mode)
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

  return (
    <div className="flex justify-center mb-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={resolution}
          height={resolution}
          className="max-w-full h-auto border border-gray-200 rounded"
          style={{ maxWidth: "600px", maxHeight: "600px" }}
        />
        {!images.upper && !images.lower && (
          <div className="flex items-center justify-center h-96 text-gray-500">预览区域</div>
        )}
      </div>
    </div>
  )
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  progress: number,
  size: number,
  bgColor: string,
  mode: "normal" | "santa",
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

  const rotation = Math.sin(progress * Math.PI * 2) * PARAMS.rotationRange
  const isRaising = rotation < 0

  const pressDownPhase = Math.max(0, Math.sin(progress * Math.PI * 2))
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle
  const compressionFactor = pressDownPhase * PARAMS.squashStrength

  const smoothCompression = easeInOutQuad(compressionFactor)

  ctx.save()
  const scaleY = 1 - smoothCompression
  const scaleX = 1 + smoothCompression * 0.2

  ctx.translate(size / 2, size)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-size / 2, -size)
  ctx.drawImage(lowerImg, 0, pressDownOffset, size, size)
  ctx.restore()

  ctx.save()
  if (isRaising) {
    const raisePivotX = Math.floor((size * 3) / 7)
    const pivotY = size - Math.floor((size * 2) / 9)
    ctx.translate(raisePivotX, pivotY + pressDownOffset)
    ctx.rotate(rotation)
    ctx.translate(-raisePivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset, size, size)
  } else {
    const pivotX = Math.floor((size * 2) / 7)
    const pivotY = size - Math.floor((size * 2) / 9)
    ctx.translate(pivotX, pivotY + pressDownOffset)
    ctx.rotate(insertionRotation)
    ctx.translate(-pivotX, -(pivotY + pressDownOffset))
    ctx.drawImage(upperImg, 0, pressDownOffset + insertionOffset, size, size)
  }
  ctx.restore()
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
