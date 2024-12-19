'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Preview from './Preview'
import BackgroundControls from './BackgroundControls'
import GIF from 'gif.js'

interface Metadata {
  id: number;
  inscription: number;
  attributes: {
    Body: string;
    [key: string]: string;
  };
}

type BodyColorType = {
  [key: string]: string;
} & {
  albino: string;
  alien: string;
  beak: string;
  binary: string;
  boned: string;
  bot: string;
  brown: string;
  dark: string;
  deathbot: string;
  dos: string;
  gold: string;
  green: string;
  grey: string;
  hyena: string;
  ion: string;
  light: string;
  medium: string;
  mempool: string;
  moon: string;
  patriot: string;
  pepe: string;
  pink: string;
  purple: string;
  rainbow: string;
  red: string;
  safemode: string;
  striped: string;
  underlord: string;
  vhs: string;
  white: string;
  wrapped: string;
  zombie: string;
};

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
  zombie: "#104119"
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
const defaultResolution = isMobile ? 400 : 600;

function reduceColorDepth(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 8) * 8;     // R
    data[i + 1] = Math.round(data[i + 1] / 8) * 8; // G
    data[i + 2] = Math.round(data[i + 2] / 8) * 8; // B
  }
}

const FRAME_COUNT = 48; // Increased from 36 to 48 for smoother animation
const BASE_FRAME_DELAY = 1000 / 30; // Aiming for 30 fps

export default function GifGenerator() {
  const [id, setId] = useState('')
  const [resolution, setResolution] = useState(defaultResolution)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState<{ upper: string | null, lower: string | null }>({ upper: null, lower: null })
  const [metadata, setMetadata] = useState<Metadata[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    loadMetadata()
  }, [])

  useEffect(() => {
    if (!outputCanvasRef.current) {
      const canvas = document.createElement('canvas')
      outputCanvasRef.current = canvas
    }
    outputCanvasRef.current.width = resolution
    outputCanvasRef.current.height = resolution
  }, [resolution])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        preview();
      }
    };

    const idInput = document.getElementById('idInput');
    idInput?.addEventListener('keypress', handleKeyPress);

    return () => {
      idInput?.removeEventListener('keypress', handleKeyPress);
    };
  }, [id]);

  useEffect(() => {
    const handleResolutionChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const newResolution = parseInt(input.value) || 600;
      setResolution(newResolution);
    };

    const resolutionInput = document.getElementById('resolutionInput');
    resolutionInput?.addEventListener('change', handleResolutionChange);

    return () => {
      resolutionInput?.removeEventListener('change', handleResolutionChange);
    };
  }, []);


  const loadMetadata = async () => {
    try {
      const response = await fetch('https://nodemonkes.4everland.store/metadata.json')
      const data = await response.json()
      setMetadata(data)
      console.log('Metadata loading complete')
    } catch (error) {
      console.error('Failed to load metadata:', error)
      showStatus('Failed to load metadata', true)
    }
  }

  const getAutoBackground = (imageId: number) => {
    const item = metadata.find(item => item.id === imageId)
    if (item?.attributes?.Body) {
      const bodyType = item.attributes.Body.toLowerCase()
      return (BODY_COLORS as BodyColorType)[bodyType] || null
    }
    return null
  }

  const findIdByInscription = (inscription: number) => {
    const item = metadata.find(item => item.inscription === inscription)
    return item ? item.id : null
  }

  const getImageId = (input: string) => {
    if (/^\d+$/.test(input)) {
      const numValue = parseInt(input)
      if (metadata.some(item => item.id === numValue)) {
        return numValue
      }
      const idFromInscription = findIdByInscription(numValue)
      if (idFromInscription) {
        showStatus(`Found ID ${idFromInscription} for Inscription Number ${numValue}`)
        return idFromInscription
      }
    }
    return null
  }

  const showStatus = (message: string, error = false) => {
    setStatus(message)
    setIsError(error)
  }

  const preview = async () => {
    if (!id) {
      showStatus('Please enter an ID or Inscription Number', true)
      return
    }

    const imageId = getImageId(id)
    if (!imageId) {
      showStatus('Invalid ID or Inscription Number', true)
      return
    }

    showStatus('Loading images...')
    try {
      setImages({
        upper: `https://nodemonkes.4everland.store/upperbody/${imageId}.png`,
        lower: `https://nodemonkes.4everland.store/lowerbody/${imageId}.png`
      })
      
      const foundMetadata = metadata.find((item: Metadata) => item.id === imageId)
      if (foundMetadata) {
        showStatus(`Preview ready (ID: ${imageId}, Inscription: ${foundMetadata.inscription}, Body: ${foundMetadata.attributes.Body})`)
      } else {
        showStatus('Preview ready')
      }
    } catch (error) {
      showStatus('Failed to load images', true)
    }
  }

  const updateBackground = (type: 'none' | 'auto' | 'custom') => {
    if (!images.upper || !images.lower) {
      showStatus('Please generate a preview first', true)
      return
    }

    let newBgColor: string
    switch (type) {
      case 'none':
        newBgColor = '#ffffff'
        break
      case 'auto':
        const autoBg = getAutoBackground(parseInt(id))
        if (!autoBg) {
          showStatus('Unable to determine automatic background color', true)
          return
        }
        newBgColor = autoBg
        break
      case 'custom':
        setShowColorPicker(true)
        return
    }

    setBgColor(newBgColor)
    showStatus(`Background updated: ${type === 'none' ? 'No background' : type === 'auto' ? 'Auto background' : 'Custom background'} (${newBgColor})`)
  }


  const generateGIF = useCallback(async () => {
    if (!images.upper || !images.lower) {
      showStatus('Please generate a preview first', true);
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const workerBlob = new Blob([`
        // gif.worker.js content goes here
      `], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(workerBlob);

      const gif = new GIF({
        workers: navigator.hardwareConcurrency > 1 ? 2 : 1,
        quality: 10,
        width: resolution,
        height: resolution,
        workerScript: workerUrl,
        dither: false,
        transparent: null,
        background: bgColor,
        repeat: 0
      });

      gif.on('progress', (p: number) => {
        setProgress(Math.round(p * 100));
      });

      const targetFrameCount = 24; // Increased from 18 to 24
      const frameSkip = Math.max(1, Math.floor(FRAME_COUNT / targetFrameCount));
      const frameDelay = Math.max(20, Math.round(BASE_FRAME_DELAY * frameSkip / speed));

      const ctx = outputCanvasRef.current?.getContext('2d');
      if (!ctx) return;

      for (let i = 0; i < FRAME_COUNT; i += frameSkip) {
        if (!outputCanvasRef.current) return;
        
        const progress = i / FRAME_COUNT;
        drawFrame(ctx, 
          await loadImage(images.upper), 
          await loadImage(images.lower), 
          progress, resolution, bgColor
        );
        
        const imageData = ctx.getImageData(0, 0, resolution, resolution);
        reduceColorDepth(imageData.data);
        ctx.putImageData(imageData, 0, 0);
        
        gif.addFrame(ctx.canvas, {copy: true, delay: frameDelay});
        showStatus(`Adding frame: ${Math.floor(i / frameSkip) + 1}/${targetFrameCount}`);
        await new Promise(r => setTimeout(r, 10));
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `animation_${id}_optimized_speed_${speed.toFixed(1)}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showStatus('GIF generation complete!');
        setProgress(0);
        setIsGenerating(false);
      });

      gif.render();

    } catch (error) {
      showStatus(`Generation failed: ${error instanceof Error ? error.message : String(error)}`, true);
      setProgress(0);
      setIsGenerating(false);
    }
  }, [images, resolution, bgColor, speed, id, outputCanvasRef]);

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
          id="idInput"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter ID or Inscription Number"
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
          id="resolutionInput"
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
      </div>

      <BackgroundControls 
        bgColor={bgColor} 
        setBgColor={setBgColor} 
        updateBackground={updateBackground}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
      />

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
        Save GIF
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
          background: isError ? '#ffebee' : '#e8f5e9',
          color: isError ? '#c62828' : '#2e7d32',
        }}>
          {status}
        </div>)}

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

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

function smoothInterpolation(start: number, end: number, t: number): number {
  return start + (end - start) * easeInOutQuad(t);
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  progress: number,
  size: number,
  bgColor: string
) {
  const PARAMS = {
    rotationRange: 0.045,
    pressDownStrength: 50,
    insertionStrength: 30,
    insertionAngle: 0.045,
    squashStrength: 0.12
  }

  ctx.clearRect(0, 0, size, size)

  ctx.fillStyle = bgColor || '#ffffff'
  ctx.fillRect(0, 0, size, size)

  const rotation = smoothInterpolation(-PARAMS.rotationRange, PARAMS.rotationRange, (Math.sin(progress * Math.PI * 2) + 1) / 2);
  const isRaising = rotation < 0

  const pressDownPhase = smoothInterpolation(0, 1, (Math.sin(progress * Math.PI * 2) + 1) / 2);
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle
  const compressionFactor = pressDownPhase * PARAMS.squashStrength

  // Smooth interpolation for compression
  const smoothCompression = easeInOutQuad(compressionFactor)

  ctx.save()
  const scaleY = 1 - smoothCompression
  const scaleX = 1 + (smoothCompression * 0.2)

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

// Easing function for smoother animation
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

