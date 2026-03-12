import { useState, useEffect, useRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
}

export function CustomSelect({ value, options, onChange, className = '' }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const current = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={
          'w-full bg-[#1a1a1a] border rounded-xl px-3 py-2 text-sm text-white ' +
          'flex items-center justify-between gap-2 transition-colors cursor-pointer ' +
          (open ? 'border-violet-500' : 'border-white/10 hover:border-white/30')
        }
      >
        <span>{current?.label}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`flex-shrink-0 text-white/40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 下拉列表 */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={
                'w-full px-3 py-2 text-sm text-left transition-colors ' +
                (opt.value === value
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white hover:bg-violet-500 hover:text-white')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
