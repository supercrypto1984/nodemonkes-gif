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
    <div>
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => updateBackground("none")}
          className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600"
        >
          无背景
        </button>
        <button
          onClick={() => updateBackground("auto")}
          className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600"
        >
          自动背景
        </button>
        <button
          onClick={() => updateBackground("custom")}
          className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600"
        >
          自定义
        </button>
      </div>
      {showColorPicker && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer bg-gray-900 border-2 border-gray-700"
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg shadow-green-900/50"
          >
            确认
          </button>
        </div>
      )}
    </div>
  )
}
