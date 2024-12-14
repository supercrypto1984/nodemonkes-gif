import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

interface BackgroundControlsProps {
  bgColor: string
  setBgColor: (color: string) => void
}

export default function BackgroundControls({ bgColor, setBgColor }: BackgroundControlsProps) {
  return (
    <div className="flex space-x-2">
      <Button onClick={() => setBgColor('#ffffff')}>无背景</Button>
      <Button onClick={() => setBgColor('auto')}>自动背景</Button>
      <Input
        type="color"
        value={bgColor}
        onChange={(e) => setBgColor(e.target.value)}
        className="w-12 h-10 p-1"
      />
    </div>
  )
}

