'use client'

import { useState, useRef, useEffect } from 'react'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'
import { GIF } from 'gif.js'

interface Metadata {
  id: number;
  inscription: number;
  attributes: {
    Body: string;
    [key: string]: string;
  };
}

export default function GifGenerator() {
  const [id, setId] = useState('')
  const [resolution, setResolution] = useState(600)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState<{ upper: string | null, lower: string | null }>({ upper: null, lower: null })
  const [metadata, setMetadata] = useState<Metadata[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadMetadata()
    // Create output canvas for GIF generation
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    outputCanvasRef.current = canvas
  }, [])

  const loadMetadata = async () => {
    try {
      const response = await fetch('https://nodemonkes.4everland.store/metadata.json')
      const data = await response.json()
      setMetadata(data)
      console.log('元数据加载完成')
    } catch (error) {
      console.error('加载元数据失败:', error)
      setStatus('加载元数据失败')
    }
  }

  const getAutoBackground = (imageId: number) => {
    const metadata = metadata.find(item => item.id === imageId)
    if (metadata?.attributes?.Body) {
      const bodyType = metadata.attributes.Body.toLowerCase()
      return BODY_COLORS[bodyType] || null
    }
    return null
  }

  const findIdByInscription = (inscription: number) => {
    const metadata = metadata.find(item => item.inscription === inscription)
    return metadata ? metadata.id : null
  }

  const getImageId = (input: string) => {
    if (/^\d+$/.test(input)) {
      const numValue = parseInt(input)
      if (metadata.some(item => item.id === numValue)) {
        return numValue
      }
      const idFromInscription = findIdByInscription(numValue)
      if (idFromInscription) {
        setStatus(`找到铭文号 ${numValue} 对应的ID: ${idFromInscription}`)
        return idFromInscription
      }
    }
    return null
  }

  const preview = async () => {
    if (!id) {
      setStatus('请输入ID或铭文号')
      return
    }

    const imageId = getImageId(id)
    if (!imageId) {
      setStatus('无效的ID或铭文号', true)
      return
    }

    setStatus('加载图片中...')
    try {
      setImages({
        upper: `https://nodemonkes.4everland.store/upperbody/${imageId}.png`,
        lower: `https://nodemonkes.4everland.store/lowerbody/${imageId}.png`
      })
      
      const foundMetadata = metadata.find((item: Metadata) => item.id === imageId)
      if (foundMetadata) {
        setStatus(`预览就绪 (ID: ${imageId}, 铭文号: ${foundMetadata.inscription}, Body: ${foundMetadata.attributes.Body})`)
      } else {
        setStatus('预览就绪')
      }
    } catch (error) {
      setStatus('加载图片失败')
    }
  }

  const reduceColorDepth = (data: Uint8ClampedArray) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / 16) * 16     // R
      data[i + 1] = Math.round(data[i + 1] / 16) * 16 // G
      data[i + 2] = Math.round(data[i + 2] / 16) * 16 // B
    }
  }

  const generateGIF = async () => {
    if (!images.upper || !images.lower) {
      setStatus('请先生成预览')
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      // Create worker blob
      const workerBlob = new Blob([await fetch('/gif.worker.js').then(r => r.text())], 
        { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(workerBlob)

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: workerUrl,
        dither: false,
        transparent: null,
        background: bgColor,
        repeat: 0
      })

      gif.on('progress', p => {
        setProgress(Math.round(p * 100))
      })

      const targetFrameCount = 18
      const frameSkip = Math.max(1, Math.floor(24 / targetFrameCount))
      const frameDelay = Math.max(20, Math.round(50 * frameSkip / speed))

      const ctx = outputCanvasRef.current?.getContext('2d')
      if (!ctx) return

      for (let i = 0; i < 24; i += frameSkip) {
        if (!outputCanvasRef.current) return
        
        drawFrame(ctx, 
          await loadImage(images.upper), 
          await loadImage(images.lower), 
          i, resolution, bgColor
        )
        
        const imageData = ctx.getImageData(0, 0, resolution, resolution)
        reduceColorDepth(imageData.data)
        ctx.putImageData(imageData, 0, 0)
        
        gif.addFrame(ctx.canvas, {copy: true, delay: frameDelay})
        setStatus(`添加帧: ${Math.floor(i / frameSkip) + 1}/${targetFrameCount}`)
        await new Promise(r => setTimeout(r, 10))
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `animation_${id}_speed_${speed.toFixed(1)}.gif`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setStatus('GIF生成完成！')
        setProgress(0)
        setIsGenerating(false)
      })

      gif.render()

    } catch (error) {
      setStatus(`生成失败: ${error instanceof Error ? error.message : String(error)}`)
      setProgress(0)
      setIsGenerating(false)
    }
  }

  return (
    <div style={{
      textAlign: 'center',
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && preview()}
          placeholder="输入ID或铭文号"
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '200px',
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <input
          type="number"
          value={resolution}
          onChange={(e) => setResolution(Number(e.target.value))}
          min={100}
          max={1200}
          step={100}
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '100px',
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={preview}
          style={{
            padding: '8px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
          }}
        >
          生成预览
        </button>
      </div>

      <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />

      <div style={{ margin: '10px 0' }}>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: '200px', marginRight: '10px' }}
        />
        <span>{speed.toFixed(1)}x</span>
      </div>

      <button
        onClick={generateGIF}
        disabled={isGenerating || !images.upper || !images.lower}
        style={{
          marginTop: '10px',
          padding: '8px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          opacity: isGenerating || !images.upper || !images.lower ? 0.5 : 1,
        }}
      >
        保存GIF
      </button>

      <Preview 
        canvasRef={canvasRef}
        images={images}
        bgColor={bgColor}
        resolution={resolution}
        speed={speed}
      />

      {status && (
        <div style={{
          margin: '10px 0',
          padding: '10px',
          borderRadius: '4px',
          textAlign: 'center',
          background: '#e8f5e9',
          color: '#2e7d32',
        }}>
          {status}
        </div>
      )}

      {isGenerating && (
        <div style={{
          width: '80%',
          margin: '10px auto',
          height: '20px',
          background: '#f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div 
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#4CAF50',
              transition: 'width 0.3s',
            }}
          />
        </div>
      )}
    </div>
  )
}

const BODY_COLORS = {
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
  zombie: "#104119"
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  frameIndex: number,
  size: number,
  bgColor: string
) {
  const PARAMS = {
    frameCount: 24,
    frameDelay: 50,
    rotationRange: 0.045,
    pressDownStrength: 50,
    insertionStrength: 30,
    insertionAngle: 0.045,
    squashStrength: 0.12
  }

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

