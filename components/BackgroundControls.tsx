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
    <div className="mb-6 text-center">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => updateBackground("none")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          无背景
        </button>
        <button
          onClick={() => updateBackground("auto")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          自动背景
        </button>
        <button
          onClick={() => updateBackground("custom")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          自定义背景
        </button>
      </div>

      {showColorPicker && (
        <div className="flex justify-center items-center gap-4">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            确认颜色
          </button>
        </div>
      )}
    </div>
  )
}
