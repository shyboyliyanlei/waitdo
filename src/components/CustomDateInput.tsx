import { useRef, useState, useEffect } from 'react'

interface CustomDateInputProps {
  value: string        // 'yyyy-MM-dd' 或 ''
  min?: string         // 'yyyy-MM-dd'
  onChange: (value: string) => void
  hasError?: boolean
}

export function CustomDateInput({ value, min, onChange, hasError }: CustomDateInputProps) {
  const yearRef  = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef   = useRef<HTMLInputElement>(null)

  // 从外部 value 拆分初始值
  const [year,  setYear]  = useState(value ? value.slice(0, 4) : '')
  const [month, setMonth] = useState(value ? value.slice(5, 7) : '')
  const [day,   setDay]   = useState(value ? value.slice(8, 10) : '')

  // 外部 value 重置（如 handleCancel / 编辑模式切换）
  useEffect(() => {
    if (!value) {
      setYear(''); setMonth(''); setDay('')
    } else {
      setYear(value.slice(0, 4))
      setMonth(value.slice(5, 7))
      setDay(value.slice(8, 10))
    }
  }, [value])

  // 三段都有值时向上通知
  function notify(y: string, m: string, d: string) {
    if (y.length === 4 && m.length >= 1 && d.length >= 1) {
      const mm = m.padStart(2, '0')
      const dd = d.padStart(2, '0')
      onChange(`${y}-${mm}-${dd}`)
    } else {
      onChange('')
    }
  }

  function handleYear(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    setYear(v)
    notify(v, month, day)
    // 输完 4 位自动跳月份
    if (v.length === 4) monthRef.current?.focus()
  }

  function handleMonth(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2)
    setMonth(v)
    notify(year, v, day)
    // 输完 2 位自动跳日期
    if (v.length === 2) dayRef.current?.focus()
  }

  function handleDay(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2)
    setDay(v)
    notify(year, month, v)
  }

  // 月份/日期输入框：按退格且内容为空时跳回上一段
  function handleMonthKey(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && month === '') yearRef.current?.focus()
  }
  function handleDayKey(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && day === '') monthRef.current?.focus()
  }

  const borderClass = hasError
    ? 'border-red-500 focus-within:border-red-400'
    : 'border-white/10 focus-within:border-violet-500'

  const inputClass =
    'bg-transparent text-white outline-none text-sm placeholder-white/25 text-center'

  return (
    <div
      className={`flex items-center bg-[#1a1a1a] border rounded-xl px-4 py-2.5 gap-1 transition-colors ${borderClass}`}
    >
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        value={year}
        onChange={handleYear}
        placeholder="YYYY"
        maxLength={4}
        className={`${inputClass} w-[3.2rem]`}
      />
      <span className="text-white/20 text-sm select-none">-</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        value={month}
        onChange={handleMonth}
        onKeyDown={handleMonthKey}
        placeholder="MM"
        maxLength={2}
        className={`${inputClass} w-[1.6rem]`}
      />
      <span className="text-white/20 text-sm select-none">-</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        value={day}
        onChange={handleDay}
        onKeyDown={handleDayKey}
        placeholder="DD"
        maxLength={2}
        className={`${inputClass} w-[1.6rem]`}
      />
    </div>
  )
}
