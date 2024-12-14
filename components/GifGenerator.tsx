'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'

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

  const generateGIF = () => {
    if (!images.upper || !images.lower) {
      setStatus('请先生成预览')
      return
    }

    setIsGenerating(true)
    setStatus('开始生成GIF...')

    // Placeholder for GIF generation logic
    setTimeout(() => {
      setIsGenerating(false)
      setStatus('GIF生成完成！')
    }, 3000)
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
          {status && <p className="text-center">{status}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

