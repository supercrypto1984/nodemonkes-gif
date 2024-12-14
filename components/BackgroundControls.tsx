'use client'

export default function BackgroundControls({ 
  bgColor, 
  setBgColor 
}: { 
  bgColor: string
  setBgColor: (color: string) => void 
}) {
  return (
    <div style={{ margin: '10px 0' }}>
      <button
        onClick={() => setBgColor('#ffffff')}
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
        onClick={() => setBgColor('auto')}
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
        onClick={() => setBgColor('#000000')}
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
    </div>
  )
}

