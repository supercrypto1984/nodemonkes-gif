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
        onClick={() => {}}
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

