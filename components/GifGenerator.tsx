"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Preview from "./Preview"
import BackgroundControls from "./BackgroundControls"
import ClientWrapper from "./ClientWrapper"
import { Button } from "./ui/button" // 导入 Button 组件
import { Input } from "./ui/input" // 导入 Input 组件
import { PARAMS, BODY_COLORS } from "../utils/constants" // 导入常量
import { cn } from "../lib/utils" // 导入 cn 辅助函数

// 动态导入 GIF.js 以避免 SSR 问题
let GIF: any = null

interface Metadata {
  id: number
  inscription: number
  attributes: {
    Body: string
    [key: string]: string
  }
}

// 使用从 utils/constants 导入的 BODY_COLORS 类型，并简化本地代码
type BodyColorType = typeof BODY_COLORS

const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const defaultResolution = isMobile ? 400 : 600

function reduceColorDepth(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 8) * 8 // R
    data[i + 1] = Math.round(data[i + 1] / 8) * 8 // G
    data[i + 2] = Math.round(data[i + 2] / 8) * 8 // B
  }
}

const FRAME_COUNT = 48
const BASE_FRAME_DELAY = 1000 / 30

function GifGeneratorContent() {
  const [id, setId] = useState("")
  const [resolution, setResolution] = useState(defaultResolution)
  const [bgColor, setBgColor] = useState("#ffffff")
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState("")
  const [isError, setIsError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState<{ upper: string | null; lower: string | null }>({ upper: null, lower: null })
  const [metadata, setMetadata] = useState<Metadata[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [mode, setMode] = useState<"normal" | "santa">("normal")
  const [metadataLoaded, setMetadataLoaded] = useState(false)
  const [gifLoaded, setGifLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // 动态加载 GIF.js
    const loadGif = async () => {
      try {
        // 使用相对路径导入 Worker
        const module = await import("gif.js")
        GIF = module.default
        setGifLoaded(true)
      } catch (error) {
        console.error("Failed to load GIF.js:", error)
      }
    }
    loadGif()
  }, [])

  useEffect(() => {
    loadMetadata()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && !outputCanvasRef.current) {
      const canvas = document.createElement("canvas")
      outputCanvasRef.current = canvas
    }
    if (outputCanvasRef.current) {
      outputCanvasRef.current.width = resolution
      outputCanvasRef.current.height = resolution
    }
  }, [resolution])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        preview()
      }
    }

    if (typeof window !== "undefined") {
      const idInput = document.getElementById("idInput")
      idInput?.addEventListener("keypress", handleKeyPress)

      return () => {
        idInput?.removeEventListener("keypress", handleKeyPress)
      }
    }
  }, [id])

  const loadMetadata = async () => {
    const metadataUrls = [
      // 使用新的 R2 公开地址作为主要数据源
      "https://pub-ce8a03b190984a3d99332e13b7d5e3cb.r2.dev/metadata.json",
      // 保留原有地址作为备用
      "https://metadata.138148178.xyz/metadata.json",
      "https://nodemonkes.4everland.store/metadata.json",
    ]

    for (const url of metadataUrls) {
      try {
        showStatus("正在加载元数据...")
        const response = await fetch(url, {
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setMetadata(data)
        setMetadataLoaded(true)
        showStatus(
          `元数据加载完成 (${data.length} 个NFT) - 数据源: ${url.includes("pub-ce8a03b") ? "R2主源" : "备用源"}`,
        )
        console.log("Metadata loading complete", data.length, "items from", url)
        return
      } catch (error) {
        console.error(`Failed to load metadata from ${url}:`, error)
        if (url === metadataUrls[metadataUrls.length - 1]) {
          showStatus("无法加载元数据，切换到离线模式。你仍然可以尝试输入ID 1-10000", true)
          setMetadataLoaded(false)
        }
      }
    }
  }

  const getAutoBackground = (imageId: number) => {
    const item = metadata.find((item) => item.id === imageId)
    if (item?.attributes?.Body) {
      const bodyType = item.attributes.Body.toLowerCase()
      return (BODY_COLORS as BodyColorType)[bodyType] || null
    }
    return null
  }

  const findIdByInscription = (inscription: number) => {
    const item = metadata.find((item) => item.inscription === inscription)
    return item ? item.id : null
  }

  const getImageId = (input: string) => {
    if (!/^\d+$/.test(input)) return null

    const numValue = Number.parseInt(input)

    if (metadataLoaded && metadata.length > 0) {
      if (metadata.some((item) => item.id === numValue)) {
        return numValue
      }
      const idFromInscription = findIdByInscription(numValue)
      if (idFromInscription) {
        showStatus(`Found ID ${idFromInscription} for Inscription Number ${numValue}`)
        return idFromInscription
      }
      return null
    }

    if (numValue >= 1 && numValue <= 10000) {
      return numValue
    }

    return null
  }

  const showStatus = (message: string, error = false) => {
    setStatus(message)
    setIsError(error)
  }

  const validateInput = (input: string) => {
    if (!input.trim()) {
      showStatus("请输入ID或铭文号", true)
      return false
    }

    if (!/^\d+$/.test(input.trim())) {
      showStatus("请输入纯数字（不包含字母或符号）", true)
      return false
    }

    return true
  }

  const preview = async () => {
    if (!validateInput(id)) {
      return
    }

    const imageId = getImageId(id.trim())
    if (!imageId) {
      const numValue = Number.parseInt(id.trim())
      if (metadataLoaded) {
        if (numValue >= 1 && numValue <= 10000) {
          showStatus(`ID ${numValue} 在数据库中不存在，请检查是否输入正确`, true)
        } else {
          showStatus(`铭文号 ${numValue} 未找到对应的Nodemonke，请检查是否输入正确`, true)
        }
      } else {
        showStatus(`ID ${numValue} 超出范围 (1-10000)，请输入有效的ID`, true)
      }
      return
    }

    showStatus("正在加载图片...")
    try {
      const imageUrls = getImageUrls(imageId, mode)

      const upperImageExists = await checkImageExists(imageUrls.upper!)
      const lowerImageExists = await checkImageExists(imageUrls.lower!)

      if (!upperImageExists || !lowerImageExists) {
        // 如果主要地址失败，尝试备用地址
        const fallbackUrls = getFallbackImageUrls(imageId, mode)
        const upperFallbackExists = await checkImageExists(fallbackUrls.upper!)
        const lowerFallbackExists = await checkImageExists(fallbackUrls.lower!)

        if (upperFallbackExists && lowerFallbackExists) {
          setImages(fallbackUrls)
          showStatus(`预览已准备就绪 (ID: ${imageId}) - 使用备用数据源`)
          return
        }

        showStatus(`ID ${imageId} 的图片文件不存在，请尝试其他ID`, true)
        return
      }

      setImages(imageUrls)

      const foundMetadata = metadata.find((item: Metadata) => item.id === imageId)
      if (foundMetadata) {
        showStatus(
          `预览已准备就绪 (ID: ${imageId}, 铭文号: ${foundMetadata.inscription}, 身体类型: ${foundMetadata.attributes.Body})`,
        )
      } else {
        showStatus(`预览已准备就绪 (ID: ${imageId})`)
      }
    } catch (error) {
      showStatus(`加载图片失败: ${error instanceof Error ? error.message : String(error)}`, true)
    }
  }

  const getImageUrls = (imageId: number | null, mode: "normal" | "santa") => {
    if (!imageId) return { upper: null, lower: null }

    if (mode === "santa") {
      // 圣诞版本使用原有的 R2 地址
      return {
        upper: `https://pub-048d93bb0a5a448783aecb63c784ccbf.r2.dev/santaupperbody/${imageId}.png`,
        lower: `https://pub-048d93bb0a5a448783aecb63c784ccbf.r2.dev/santalowerbody/${imageId}.png`,
      }
    } else {
      // 普通版本使用新的 R2 公开地址
      return {
        upper: `https://pub-b4dd93b94d3b4b3a93fa599c57a78615.r2.dev/upperbody/${imageId}.png`,
        lower: `https://pub-b4dd93b94d3b4b3a93fa599c57a78615.r2.dev/lowerbody/${imageId}.png`,
      }
    }
  }

  const getFallbackImageUrls = (imageId: number | null, mode: "normal" | "santa") => {
    if (!imageId) return { upper: null, lower: null }

    if (mode === "santa") {
      // 圣诞版本的备用地址
      return {
        upper: `https://santamonkes.138148178.xyz/santaupperbody/${imageId}.png`,
        lower: `https://santamonkes.138148178.xyz/santalowerbody/${imageId}.png`,
      }
    } else {
      // 普通版本的备用地址
      return {
        upper: `https://nodemonkegif.138148178.xyz/upperbody/${imageId}.png`,
        lower: `https://nodemonkegif.138148178.xyz/lowerbody/${imageId}.png`,
      }
    }
  }

  const updateBackground = (type: "none" | "auto" | "custom") => {
    if (!images.upper || !images.lower) {
      showStatus("请生成预览后选择背景", true)
      return
    }

    let newBgColor: string
    switch (type) {
      case "none":
        newBgColor = "#ffffff"
        break
      case "auto":
        const autoBg = getAutoBackground(Number.parseInt(id))
        if (!autoBg) {
          showStatus("无法自动确定背景颜色", true)
          return
        }
        newBgColor = autoBg
        break
      case "custom":
        setShowColorPicker(true)
        return
    }

    setBgColor(newBgColor)
    showStatus(
      `背景已更新: ${type === "none" ? "无背景" : type === "auto" ? "自动背景" : "自定义背景"} (${newBgColor})`,
    )
  }

  const generateGIF = useCallback(async () => {
    if (!images.upper || !images.lower || !GIF || !gifLoaded) {
      showStatus("GIF库未加载完成，请稍后再试", true)
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      const gif = new GIF({
        workers: 1,
        quality: 10,
        width: resolution,
        height: resolution,
        dither: false,
        transparent: null,
        background: bgColor,
        repeat: 0,
        workerScript: "/gif.worker.js", // 确保 worker 路径正确
      })

      gif.on("progress", (p: number) => {
        setProgress(Math.round(p * 100))
      })

      const targetFrameCount = 24
      const frameSkip = Math.max(1, Math.floor(FRAME_COUNT / targetFrameCount))
      const frameDelay = Math.max(20, Math.round((BASE_FRAME_DELAY * frameSkip) / speed))

      const ctx = outputCanvasRef.current?.getContext("2d")
      if (!ctx) return

      for (let i = 0; i < FRAME_COUNT; i += frameSkip) {
        if (!outputCanvasRef.current) return

        const progress = i / FRAME_COUNT
        drawFrame(ctx, await loadImage(images.upper), await loadImage(images.lower), progress, resolution, bgColor)

        const imageData = ctx.getImageData(0, 0, resolution, resolution)
        reduceColorDepth(imageData.data)
        ctx.putImageData(imageData, 0, 0)

        gif.addFrame(ctx.canvas, { copy: true, delay: frameDelay })
        showStatus(`正在添加帧: ${Math.floor(i / frameSkip) + 1}/${targetFrameCount}`)
        await new Promise((r) => setTimeout(r, 10))
      }

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `nodemonke_${id}_${mode}_${speed.toFixed(1)}x.gif`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        showStatus("GIF生成完成！")
        setProgress(0)
        setIsGenerating(false)
      })

      gif.render()
    } catch (error) {
      showStatus(`生成失败: ${error instanceof Error ? error.message : String(error)}`, true)
      setProgress(0)
      setIsGenerating(false)
    }
  }, [images, resolution, bgColor, speed, id, mode, outputCanvasRef, gifLoaded])

  return (
    // ⭐️ 核心 UI 布局: 双栏布局，深色主题，左侧预览，右侧控制
    <div className="flex flex-col lg:flex-row max-w-6xl mx-auto p-4 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl">
      
      {/* 1. 左侧: 预览和控制 */}
      <div className="flex flex-col items-center lg:items-start lg:w-1/2 p-4 border-r border-gray-800">
        <h2 className="text-2xl font-semibold text-white mb-6">GIF 生成器</h2>

        {/* 预览区域 (Canvas) */}
        <Preview
          canvasRef={canvasRef}
          images={images}
          bgColor={bgColor}
          resolution={resolution}
          speed={speed}
          mode={mode}
        />

        {/* 动画速度控制 */}
        <div className="w-full max-w-[600px] mt-6 px-4">
          <label htmlFor="speedInput" className="block text-sm font-medium text-gray-300 mb-2">
            动画速度: <span className="text-green-400">{speed.toFixed(1)}x</span>
          </label>
          <input
            id="speedInput"
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
          />
        </div>
      </div>
      
      {/* 2. 右侧: 输入和功能控制 */}
      <div className="lg:w-1/2 p-4 space-y-6">
        
        {/* 模式选择 */}
        <div className="flex space-x-3">
          <Button
            onClick={() => {
              setMode("normal")
              if (id) {
                const imageId = getImageId(id)
                if (imageId) {
                  setImages(getImageUrls(imageId, "normal"))
                }
              }
            }}
            variant={mode === "normal" ? "default" : "secondary"}
            className={cn(
              "text-base", 
              mode === "normal" ? "bg-green-600 hover:bg-green-500" : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            )}
          >
            Normal
          </Button>
          <Button
            onClick={() => {
              setMode("santa")
              if (id) {
                const imageId = getImageId(id)
                if (imageId) {
                  setImages(getImageUrls(imageId, "santa"))
                }
              }
            }}
            variant={mode === "santa" ? "default" : "secondary"}
            className={cn(
              "text-base",
              mode === "santa" ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            )}
          >
            🎅 Santa Hat
          </Button>
        </div>

        {/* ID 输入 */}
        <div className="space-y-2">
          <label htmlFor="idInput" className="block text-sm font-medium text-gray-300">
            Nodemonke ID / 铭文号
          </label>
          <div className="flex space-x-3">
            <Input
              id="idInput"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="输入 1 - 10000"
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <Button onClick={preview} className="bg-blue-600 hover:bg-blue-500">
              生成预览
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            推荐尝试: 1, 100, 1000, 5000 | 离线模式：仅支持ID 1-10000
          </p>
        </div>

        {/* 分辨率设置 */}
        <div className="space-y-2">
          <label htmlFor="resolutionInput" className="block text-sm font-medium text-gray-300">
            GIF 分辨率 (px): <span className="text-yellow-400">{resolution}</span>
          </label>
          <input
            id="resolutionInput"
            type="range"
            min={100}
            max={1200}
            step={100}
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
          />
        </div>
        
        {/* 背景控制 */}
        <BackgroundControls
          bgColor={bgColor}
          setBgColor={setBgColor}
          updateBackground={updateBackground}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
        />

        {/* 保存 GIF 按钮 */}
        <Button
          onClick={generateGIF}
          disabled={isGenerating || !images.upper || !images.lower || !gifLoaded}
          className={cn(
            "w-full py-6 text-lg font-bold transition-all duration-300",
            isGenerating ? "bg-yellow-600" : "bg-purple-600 hover:bg-purple-500",
          )}
        >
          {isGenerating ? `生成中... ${progress}%` : "⬇️ 下载 GIF"}
        </Button>
      </div>

      {/* 3. 状态消息 */}
      {status && (
        <div
          className={cn(
            "fixed top-4 right-4 p-3 rounded-lg font-medium shadow-xl z-50",
            isError ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300",
          )}
        >
          {status}
        </div>
      )}
    </div>
  )
}

export default function GifGenerator() {
  return (
    <ClientWrapper>
      <GifGeneratorContent />
    </ClientWrapper>
  )
}

// -----------------------------------------------------------
// 动画辅助函数 (保持不变)
// -----------------------------------------------------------

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

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

const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}
