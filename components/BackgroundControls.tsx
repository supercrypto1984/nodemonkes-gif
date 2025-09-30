"use client"

import { Button } from "./ui/button" // 确保导入 Button 组件
import { Input } from "./ui/input"   // 确保导入 Input 组件

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
    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">背景控制</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => updateBackground("none")}
          variant="outline"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
        >
          无背景
        </Button>
        <Button
          onClick={() => updateBackground("auto")}
          variant="outline"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
        >
          自动背景
        </Button>
        <Button
          onClick={() => updateBackground("custom")}
          variant="outline"
          className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
        >
          自定义颜色
        </Button>
      </div>

      {showColorPicker && (
        <div className="flex items-center space-x-3 pt-2">
          <Input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-16 h-10 p-0 border-none cursor-pointer [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            style={{
                backgroundColor: 'transparent',
            }}
          />
          <Input 
            type="text" 
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)}
            placeholder="#RRGGBB"
            className="w-32 bg-gray-700 border-gray-600 text-white"
          />
          <Button
            onClick={() => setShowColorPicker(false)}
            variant="default"
            className="bg-green-600 hover:bg-green-500"
          >
            确认
          </Button>
        </div>
      )}
    </div>
  )
}
