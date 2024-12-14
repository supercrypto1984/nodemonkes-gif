'use client'

export default function BackgroundControls({ 
  bgColor, 
  setBgColor 
}: { 
  bgColor: string
  setBgColor: (color: string) => void 
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setBgColor('#ffffff')}
        className="px-4 py-1 bg-gray-200 hover:bg-gray-300"
      >
        无背景
      </button>
      <button
        onClick={() => setBgColor('auto')}
        className="px-4 py-1 bg-gray-200 hover:bg-gray-300"
      >
        自动背景
      </button>
      <button
        onClick={() => setBgColor('#000000')}
        className="px-4 py-1 bg-gray-200 hover:bg-gray-300"
      >
        自定义背景
      </button>
    </div>
  )
}

