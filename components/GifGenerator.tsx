'use client'

import { useState, useRef, useEffect } from 'react'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'

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
      
      const metadata = metadata.find(item => item.id === parseInt(id))
      if (metadata) {
        setStatus(`预览就绪 (ID: ${id}, 铭文号: ${metadata.inscription}, Body: ${metadata.attributes.Body})`)
      } else {
        setStatus('预览就绪')
      }
    } catch (error) {
      setStatus('加载图片失败')
    }
  }

  return (
    <div className="container max-w-[1100px] mx-auto bg-white p-5 rounded-lg shadow">
      <div className="controls space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && preview()}
            placeholder="输入ID或铭文号"
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            min={100}
            max={1200}
            step={100}
            placeholder="分辨率(100-1200)"
            className="w-32 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={preview}
            className="px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#45a049] transition-colors"
          >
            生成预览
          </button>
        </div>

        <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />

        <div className="speed-control flex items-center gap-2">
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1"
          />
          <span>{speed.toFixed(1)}x</span>
        </div>

        <button
          onClick={() => {}}
          disabled={isGenerating || !images.upper || !images.lower}
          className="w-full px-4 py-2 bg-[#2196F3] text-white rounded hover:bg-[#1976D2] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? '生成中...' : '保存GIF'}
        </button>
      </div>

      <Preview 
        canvasRef={canvasRef}
        images={images}
        bgColor={bgColor}
        resolution={resolution}
        speed={speed}
      />

      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.includes('失败') ? 'bg-red-100 text-red-700' : 
          status.includes('完成') ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {status}
        </div>
      )}

      {isGenerating && (
        <div className="mt-4 w-4/5 mx-auto h-5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4CAF50] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

