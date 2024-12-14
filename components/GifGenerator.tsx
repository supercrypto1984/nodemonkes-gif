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
    <div className="flex flex-col items-center">
      <div className="w-full flex flex-wrap gap-2 items-center justify-center mb-4">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && preview()}
          placeholder="输入ID或铭文号"
          className="border border-gray-300 px-2 py-1"
        />
        <input
          type="text"
          value={resolution}
          onChange={(e) => setResolution(Number(e.target.value))}
          className="border border-gray-300 px-2 py-1 w-16"
        />
        <button
          onClick={preview}
          className="px-4 py-1 bg-[#4CAF50] text-white hover:bg-[#45a049]"
        >
          生成预览
        </button>
      </div>

      <BackgroundControls bgColor={bgColor} setBgColor={setBgColor} />

      <div className="w-full flex items-center gap-2 my-4">
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
        className="px-4 py-1 bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
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
        <div className="mt-4 w-full py-2 px-4 bg-[#E8F5E9] text-[#2E7D32] text-center">
          {status}
        </div>
      )}

      {isGenerating && (
        <div className="w-full mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4CAF50] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

