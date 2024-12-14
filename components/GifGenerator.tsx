'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'
import { GIF, AnimatedGIF } from 'gif.js'

const PARAMS = {
  frameCount: 24,
  frameDelay: 50,
  rotationRange: 0.045,
  pressDownStrength: 50,
  insertionStrength: 30,
  insertionAngle: 0.045,
  squashStrength: 0.12
}

export default function GifGenerator() {
  const [id, setId] = useState('')
  const [resolution, setResolution] = useState(600)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [metadata, setMetadata] = useState<any>(null)
  const [images, setImages] = useState<{ upper: HTMLImageElement | null, lower: HTMLImageElement | null }>({ upper: null, lower: null })

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
      const [upper, lower] = await Promise.all([
        loadImage(`https://nodemonkes.4everland.store/upperbody/${imageId}.png`),
        loadImage(`https://nodemonkes.4everland.store/lowerbody/${imageId}.png`)
      ])
      
      setImages({ upper, lower })
      setBgColor('#ffffff')

      const metadataItem = metadata.find((item: any) => item.id === imageId)
      if (metadataItem) {
        setStatus(`预览就绪 (ID: ${imageId}, 铭文号: ${metadataItem.inscription}, Body: ${metadataItem.attributes.Body})`)
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
    setProgress(0)
    setStatus('开始生成GIF...')

    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: '/gif.worker.js',
        background: bgColor
      })

      gif.on('progress', (p: number) => setProgress(Math.round(p * 100)))

      const targetFrameCount = 18
      const frameSkip = Math.max(1, Math.floor(PARAMS.frameCount / targetFrameCount))
      const frameDelay = Math.max(20, Math.round(PARAMS.frameDelay * frameSkip / speed))

      for (let i = 0; i < PARAMS.frameCount; i += frameSkip) {
        const canvas = document.createElement('canvas')
        canvas.width = resolution
        canvas.height = resolution
        const ctx = canvas.getContext('2d')
        if (ctx) {
          drawFrame(ctx, images.upper, images.lower, i, resolution, bgColor)
          gif.addFrame(ctx, { copy: true, delay: frameDelay })
        }
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
        setIsGenerating(false)
      })

      gif.render()
    } catch (error) {
      setStatus(`生成失败: ${error}`)
      setIsGenerating(false)
    }
  }

  const getImageId = (input: string): number | null => {
    if (/^\d+$/.test(input)) {
      const numValue = parseInt(input)
      if (metadata.some((item: any) => item.id === numValue)) {
        return numValue
      }
      const idFromInscription = metadata.find((item: any) => item.inscription === numValue)
      if (idFromInscription) {
        setStatus(`找到铭文号 ${numValue} 对应的ID: ${idFromInscription.id}`)
        return idFromInscription.id
      }
    }
    return null
  }

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`无法加载图片: ${url}`))
      img.src = url
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="输入ID或铭文号"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <Input
              type="number"
              placeholder="分辨率"
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              min={100}
              max={1200}
              step={100}
            />
            <Button onClick={preview}>生成预览</Button>
          </div>
          <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />
          <div className="flex items-center space-x-2">
            <span>速度: {speed.toFixed(1)}x</span>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              min={1}
              max={20}
              step={0.1}
            />
          </div>
          <Button onClick={generateGIF} disabled={isGenerating || !images.upper || !images.lower}>
            {isGenerating ? '生成中...' : '保存GIF'}
          </Button>
          <Preview canvasRef={canvasRef} images={images} bgColor={bgColor} resolution={resolution} speed={speed} />
          {isGenerating && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {status && <p className="text-center">{status}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function drawFrame(ctx: CanvasRenderingContext2D, upperImg: HTMLImageElement, lowerImg: HTMLImageElement, frameIndex: number, size: number, bgColor: string) {
  // Implementation of drawFrame function (same as in the original code)
  // ...
}

