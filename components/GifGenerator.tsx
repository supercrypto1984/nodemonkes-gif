'use client'

import { useState, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Slider } from '../components/ui/slider'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'
import { GIF } from 'gif.js'

export default function GifGenerator() {
  const [id, setId] = useState('')
  const [resolution, setResolution] = useState(600)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [images, setImages] = useState<{ upper: string | null, lower: string | null }>({ upper: null, lower: null })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const preview = async () => {
    if (!id) {
      setStatus('请输入ID或铭文号')
      return
    }

    setStatus('加载图片中...')
    try {
      setImages({
        upper: `https://nodemonkes.4everland.store/upperbody/${id}.png`,
        lower: `https://nodemonkes.4everland.store/lowerbody/${id}.png`
      })
      setStatus('预览就绪')
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

    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: '/nodemonkes-gif/gif.worker.js'
      })

      gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nodemonke_${id}.gif`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsGenerating(false)
        setStatus('GIF生成完成！')
      })

      gif.render()
    } catch (error) {
      setIsGenerating(false)
      setStatus('GIF生成失败')
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
      </CardContent>
    </Card>
  )
}

