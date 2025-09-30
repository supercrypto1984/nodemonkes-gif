"use client"

interface BackgroundControlsProps {
  bgColor: string
  setBgColor: (color: string) => void
  updateBackground: (type: "none" | "auto" | "custom") => void
  showColorPicker: boolean
  setShowColorPicker: (show: boolean) => void
}

export default function BackgroundControls({
  bgColor,
  setBgColor,
  updateBackground,
  showColorPicker,
  setShowColorPicker,
}: BackgroundControlsProps) {
  return (
    // 使用 Tailwind 类实现居中
    <div className="my-3 flex justify-center flex-wrap">
      <button
        onClick={() => updateBackground("none")}
        className="py-2 px-5 text-base cursor-pointer bg-green-500 text-white border-none rounded-md m-1 hover:bg-green-600 transition-colors"
      >
        无背景
      </button>
      <button
        onClick={() => updateBackground("auto")}
        className="py-2 px-5 text-base cursor-pointer bg-green-500 text-white border-none rounded-md m-1 hover:bg-green-600 transition-colors"
      >
        自动背景
      </button>
      <button
        onClick={() => updateBackground("custom")}
        className="py-2 px-5 text-base cursor-pointer bg-green-500 text-white border-none rounded-md m-1 hover:bg-green-600 transition-colors"
      >
        自定义背景
      </button>
      {showColorPicker && (
        // 使用 Tailwind 类实现居中
        <div className="my-3 flex justify-center items-center w-full">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-24 p-1 border border-gray-300 rounded-md mr-3"
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="py-2 px-5 text-base cursor-pointer bg-green-500 text-white border-none rounded-md hover:bg-green-600 transition-colors"
          >
            确认颜色
          </button>
        </div>
      )}
    </div>
  )
}
