'use client'

import { useState, useRef, useEffect } from 'react'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'

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
      
      const foundMetadata = metadata.find((item: Metadata) => item.id === parseInt(id));
      if (foundMetadata) {
        setStatus(`预览就绪 (ID: ${id}, 铭文号: ${foundMetadata.inscription}, Body: ${foundMetadata.attributes.Body})`);
      } else {
        setStatus('预览就绪');
      }
    } catch (error) {
      setStatus('加载图片失败')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && preview()}
            placeholder="输入ID或铭文号"
            className="px-2 py-1 border border-gray-300"
          />
          <input
            type="number"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            min={100}
            max={1200}
            step={100}
            className="w-16 px-2 py-1 border border-gray-300"
          />
          <button
            onClick={preview}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300"
          >
            生成预览
          </button>
        </div>

        <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />

        <div className="flex items-center gap-2 my-2">
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
          className="px-4 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        >
          保存GIF
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
        <div className="px-4 py-2 text-sm text-gray-600">
          {status}
        </div>
      )}

      {isGenerating && (
        <div className="w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

