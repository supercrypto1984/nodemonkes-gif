'use client'

export default function BackgroundControls({ 
  bgColor, 
  setBgColor 
}: { 
  bgColor: string
  setBgColor: (color: string) => void 
}) {
  return (
    <div className="background-controls flex justify-center gap-2">
      <button
        onClick={() => setBgColor('#ffffff')}
        className="px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#45a049] transition-colors"
      >
        无背景
      </button>
      <button
        onClick={() => setBgColor('auto')}
        className="px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#45a049] transition-colors"
      >
        自动背景
      </button>
      <button
        onClick={() => setBgColor('#000000')}
        className="px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#45a049] transition-colors"
      >
        自定义背景
      </button>
    </div>
  )
}

