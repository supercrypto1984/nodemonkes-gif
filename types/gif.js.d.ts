declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    dither?: boolean
    debug?: boolean
    repeat?: number
  }

  export class GIF {
    constructor(options: GIFOptions)
    addFrame(imageElement: CanvasImageSource, options?: { delay?: number; copy?: boolean }): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (percent: number) => void): void
    render(): void
    abort(): void
  }
}

