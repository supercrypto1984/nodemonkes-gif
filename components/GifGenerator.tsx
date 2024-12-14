'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Slider } from '../components/ui/slider'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'
import { GIF } from 'gif.js'

const PARAMS = {
  frameCount: 24,
  frameDelay: 50,
  rotationRange: 0.045,
  pressDownStrength: 50,
  insertionStrength: 30,
  insertionAngle: 0.045,
  squashStrength: 0.12
};

export default function GifGenerator() {
  const [id, setId] = useState('')
  const [resolution, setResolution] = useState(600)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState<{ upper: string | null, lower: string | null }>({ upper: null, lower: null })
  const [metadata, setMetadata] = useState<any[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadMetadata()
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

  const getImageId = (input: string) => {
    if (/^\d+$/.test(input)) {
      const numValue = parseInt(input)
      if (metadata.some(item => item.id === numValue)) {
        return numValue
      }
      const idFromInscription = metadata.find(item => item.inscription === numValue)?.id
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
      setStatus('无效的ID或铭文号')
      return
    }

    setStatus('加载图片中...')
    try {
      setImages({
        upper: `https://nodemonkes.4everland.store/upperbody/${imageId}.png`,
        lower: `https://nodemonkes.4everland.store/lowerbody/${imageId}.png`
      })
      const metadata = metadata.find(item => item.id === imageId)
      if (metadata) {
        setStatus(`预览就绪 (ID: ${imageId}, 铭文号: ${metadata.inscription}, Body: ${metadata.attributes.Body})`)
      } else {
        setStatus('预览就绪')
      }
    } catch (error) {
      setStatus('加载图片失败')
    }
  }

  const generateGIF = async () => {
    if (!images.upper || !images.lower) {
      setStatus('请先生成预览')
      return
    }

    setIsGenerating(true)
    setStatus('开始生成GIF...')
    setProgress(0)

    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: '/gif.worker.js',
        background: bgColor,
        transparent: null,
        repeat: 0
      })

      gif.on('progress', p => {
        setProgress(Math.round(p * 100))
      })

      const targetFrameCount = 18
      const frameSkip = Math.max(1, Math.floor(PARAMS.frameCount / targetFrameCount))
      const frameDelay = Math.max(20, Math.round(PARAMS.frameDelay * frameSkip / speed))

      const canvas = document.createElement('canvas')
      canvas.width = resolution
      canvas.height = resolution
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('无法创建canvas上下文')
      }

      for (let i = 0; i < PARAMS.frameCount; i += frameSkip) {
        drawFrame(ctx, images.upper, images.lower, i, resolution, bgColor)
        const imageData = ctx.getImageData(0, 0, resolution, resolution)
        reduceColorDepth(imageData.data)
        ctx.putImageData(imageData, 0, 0)
        gif.addFrame(ctx, { copy: true, delay: frameDelay })
        setStatus(`添加帧: ${Math.floor(i / frameSkip) + 1}/${targetFrameCount}`)
        await new Promise(r => setTimeout(r, 10))
      }

      gif.on('finished', (blob) => {
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
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">GIF生成器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="输入ID或铭文号"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && preview()}
            className="md:col-span-2"
          />
          <Input
            type="number"
            placeholder="分辨率"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            min={100}
            max={1200}
            step={100}
            className="md:col-span-1"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={preview}
            className="w-full md:w-auto"
            variant="default"
          >
            生成预览
          </Button>
        </div>

        <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">速度: {speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        <Button 
          onClick={generateGIF} 
          disabled={isGenerating || !images.upper || !images.lower}
          className="w-full"
          variant="default"
        >
          {isGenerating ? '生成中...' : '保存GIF'}
        </Button>

        <Preview 
          canvasRef={canvasRef} 
          images={images} 
          bgColor={bgColor} 
          resolution={resolution} 
          speed={speed} 
        />

        {status && (
          <div className={`text-center p-2 rounded-md ${
            status.includes('失败') ? 'bg-red-100 text-red-700' : 
            status.includes('完成') ? 'bg-green-100 text-green-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        {isGenerating && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function drawFrame(ctx: CanvasRenderingContext2D, upperImg: string, lowerImg: string, frameIndex: number, size: number, bgColor: string) {
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

function reduceColorDepth(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 16) * 16     // R
    data[i + 1] = Math.round(data[i + 1] / 16) * 16 // G
    data[i + 2] = Math.round(data[i + 2] / 16) * 16 // B
  }
}
