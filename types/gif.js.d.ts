declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    dither?: boolean | string
    debug?: boolean
    repeat?: number
    background?: string
    transparent?: string | null
    globalPalette?: boolean | number[]
  }

  export default class GIF {
    constructor(options: GIFOptions)
    
    addFrame(imageElement: CanvasImageSource, options?: { 
      delay?: number
      copy?: boolean
      dispose?: number 
    }): void
    
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (percent: number) => void): void
    on(event: 'abort', callback: () => void): void
    
    render(): void
    abort(): void
    
    // Additional properties
    running: boolean
    options: GIFOptions
    frames: any[]
  }
}

