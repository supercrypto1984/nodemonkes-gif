import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

interface BackgroundControlsProps {
  bgColor: string
  setBgColor: (color: string) => void
}

export default function BackgroundControls({ bgColor, setBgColor }: BackgroundControlsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        onClick={() => setBgColor('#ffffff')}
        variant="outline"
        className="flex-1 min-w-[120px]"
      >
        无背景
      </Button>
      <Button 
        onClick={() => setBgColor('auto')}
        variant="outline"
        className="flex-1 min-w-[120px]"
      >
        自动背景
      </Button>
      <div className="relative flex-1 min-w-[120px]">
        <Input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-full h-10 cursor-pointer"
        />
      </div>
    </div>
  )
}
