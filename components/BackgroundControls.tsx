'use client'

interface BackgroundControlsProps {
  bgColor: string
  setBgColor: (color: string) => void
  updateBackground: (type: 'none' | 'auto' | 'custom') => void
  showColorPicker: boolean
  setShowColorPicker: (show: boolean) => void
}

export default function BackgroundControls({
  bgColor,
  setBgColor,
  updateBackground,
  showColorPicker,
  setShowColorPicker
}: BackgroundControlsProps) {
  return (
    <div style={{ margin: '10px 0' }}>
      <button
        onClick={() => updateBackground('none')}
        style={{
          padding: '8px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '0 5px',
        }}
      >
        无背景
      </button>
      <button
        onClick={() => updateBackground('auto')}
        style={{
          padding: '8px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '0 5px',
        }}
      >
        自动背景
      </button>
      <button
        onClick={() => updateBackground('custom')}
        style={{
          padding: '8px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '0 5px',
        }}
      >
        自定义背景
      </button>
      {showColorPicker && (
        <div style={{ margin: '10px 0' }}>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{
              width: '100px',
              padding: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button
            onClick={() => setShowColorPicker(false)}
            style={{
              padding: '8px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              margin: '0 5px',
            }}
          >
            确认颜色
          </button>
        </div>
      )}
    </div>
  )
}

