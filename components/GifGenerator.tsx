"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Preview from "./Preview"
import BackgroundControls from "./BackgroundControls"

// 动态导入 GIF.js 以避免 SSR 问题
let GIF: any = null
if (typeof window !== "undefined") {
  import("gif.js").then((module) => {
    GIF = module.default
  })
}

interface Metadata {
  id: number
  inscription: number
  attributes: {
    Body: string
    [key: string]: string
  }
}

type BodyColorType = {
  [key: string]: string
} & {
  albino: string
  alien: string
  beak: string
  binary: string
  boned: string
  bot: string
  brown: string
  dark: string
  deathbot: string
  dos: string
  gold: string
  green: string
  grey: string
  hyena: string
  ion: string
  light: string
  medium: string
  mempool: string
  moon: string
  patriot: string
  pepe: string
  pink: string
  purple: string
  rainbow: string
  red: string
  safemode: string
  striped: string
  underlord: string
  vhs: string
  white: string
  wrapped: string
  zombie: string
}

const BODY_COLORS: BodyColorType = {
  albino: "#BDADAD",
  alien: "#04CFE7",
  beak: "#F8AC00",
  binary: "#010101",
  boned: "#000000",
  bot: "#484848",
  brown: "#310000",
  dark: "#482510",
  deathbot: "#282831",
  dos: "#0002A5",
  gold: "#FFAA01",
  green: "#002205",
  grey: "#232A30",
  hyena: "#BA8837",
  ion: "#060F26",
  light: "#B7844F",
  medium: "#945321",
  mempool: "#BE0B3A",
  moon: "#3501BB",
  patriot: "#0D0060",
  pepe: "#127602",
  pink: "#E944CE",
  purple: "#38034A",
  rainbow: "#009DFF",
  red: "#630001",
  safemode: "#000DFF",
  striped: "#110654",
  underlord: "#9C0901",
  vhs: "#0600FF",
  white: "#c7bcb6",
  wrapped: "#FFFFFF",
  zombie: "#104119",
}

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

export default function GifGenerator() {
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

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)

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
        showStatus(`元数据加载完成 (${data.length} 个NFT)`)
        console.log("Metadata loading complete", data.length, "items")
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
      return {
        upper: `https://santamonkes.138148178.xyz/santaupperbody/${imageId}.png`,
        lower: `https://santamonkes.138148178.xyz/santalowerbody/${imageId}.png`,
      }
    } else {
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
    if (!images.upper || !images.lower || !GIF) {
      showStatus("请生成预览后保存GIF", true)
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      // 创建一个简化的 worker script 内容
      const workerScript = `
        self.onmessage = function(e) {
          // 简化的 worker 实现
          self.postMessage(e.data);
        };
      `

      const workerBlob = new Blob([workerScript], { type: "application/javascript" })
      const workerUrl = URL.createObjectURL(workerBlob)

      const gif = new GIF({
        workers: 1, // 减少 worker 数量
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: workerUrl,
        dither: false,
        transparent: null,
        background: bgColor,
        repeat: 0,
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
        URL.revokeObjectURL(workerUrl)
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
  }, [images, resolution, bgColor, speed, id, mode, outputCanvasRef])

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* 状态指示器 */}
      <div
        className={`mb-6 p-4 rounded-lg text-sm ${metadataLoaded ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-800"}`}
      >
        状态: {metadataLoaded ? "✅ 在线模式 - 完整功能可用" : "⚠️ 离线模式 - 基础功能可用"}
      </div>

      {/* 模式选择 */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => {
            setMode("normal")
            if (id) {
              const imageId = getImageId(id)
              if (imageId) {
                setImages(getImageUrls(imageId, "normal"))
              }
            }
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === "normal" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => {
            setMode("santa")
            if (id) {
              const imageId = getImageId(id)
              if (imageId) {
                setImages(getImageUrls(imageId, "santa"))
              }
            }
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === "santa" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Santa Hat
        </button>
      </div>

      {/* ID 输入 */}
      <div className="mb-6 text-center">
        <input
          id="idInput"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="输入ID或铭文号"
          className="px-4 py-2 border border-gray-300 rounded-lg text-center text-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="mt-2 text-sm text-gray-600">推荐尝试: 1, 100, 1000, 5000, 8232 (范围: 1-10000)</div>
        <div className="text-xs text-gray-500">
          {metadataLoaded ? "或输入铭文号查找对应的Nodemonke" : "离线模式：仅支持ID 1-10000"}
        </div>
      </div>

      {/* 分辨率设置 */}
      <div className="mb-6 text-center">
        <label className="block text-sm font-medium text-gray-700 mb-2">分辨率 (px):</label>
        <input
          id="resolutionInput"
          type="number"
          value={resolution}
          onChange={(e) => setResolution(Number(e.target.value))}
          min={100}
          max={1200}
          step={100}
          className="px-4 py-2 border border-gray-300 rounded-lg text-center w-32 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="mt-1 text-xs text-gray-500">调整生成的GIF大小 (100-1200像素)</div>
      </div>

      {/* 生成预览按钮 */}
      <div className="mb-6 text-center">
        <button
          onClick={preview}
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          生成预览
        </button>
      </div>

      {/* 背景控制 */}
      <BackgroundControls
        bgColor={bgColor}
        setBgColor={setBgColor}
        updateBackground={updateBackground}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
      />

      {/* 动画速度 */}
      <div className="mb-6 text-center">
        <label className="block text-sm font-medium text-gray-700 mb-2">动画速度:</label>
        <div className="flex items-center justify-center gap-4">
          <input
            id="speedInput"
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-64"
          />
          <span className="text-lg font-medium">{speed.toFixed(1)}x</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">调整动画速度 (0.1x - 5x)</div>
      </div>

      {/* 保存GIF按钮 */}
      <div className="mb-6 text-center">
        <button
          onClick={generateGIF}
          disabled={isGenerating || !images.upper || !images.lower}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            isGenerating || !images.upper || !images.lower
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isGenerating ? "生成中..." : "保存GIF"}
        </button>
      </div>

      {/* 预览区域 */}
      <Preview
        canvasRef={canvasRef}
        images={images}
        bgColor={bgColor}
        resolution={resolution}
        speed={speed}
        mode={mode}
      />

      {/* 状态消息 */}
      {status && (
        <div
          className={`mt-6 p-4 rounded-lg text-center ${
            isError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
          }`}
        >
          {status}
        </div>
      )}

      {/* 进度条 */}
      {isGenerating && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">{progress}% 完成</div>
        </div>
      )}
    </div>
  )
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

function smoothInterpolation(start: number, end: number, t: number): number {
  return start + (end - start) * easeInOutQuad(t)
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

  const rotation = smoothInterpolation(
    -PARAMS.rotationRange,
    PARAMS.rotationRange,
    (Math.sin(progress * Math.PI * 2) + 1) / 2,
  )
  const isRaising = rotation < 0

  const pressDownPhase = smoothInterpolation(0, 1, (Math.sin(progress * Math.PI * 2) + 1) / 2)
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

const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}
