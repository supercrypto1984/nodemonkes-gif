'use client'

export default function BackgroundControls({ 
  bgColor, 
  setBgColor 
}: { 
  bgColor: string
  setBgColor: (color: string) => void 
}) {
  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => setBgColor('#ffffff')}
        className="px-4 py-1 bg-[#4CAF50] text-white hover:bg-[#45a049]"
      >
        无背景
      </button>
      <button
        onClick={() => setBgColor('auto')}
        className="px-4 py-1 bg-[#4CAF50] text-white hover:bg-[#45a049]"
      >
        自动背景
      </button>
      <button
        onClick={() => setBgColor('#000000')}
        className="px-4 py-1 bg-[#4CAF50] text-white hover:bg-[#45a049]"
      >
        自定义背景
      </button>
    </div>
  )
}

