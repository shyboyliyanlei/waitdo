import { useRef, useState, useEffect } from 'react'

interface CustomDateInputProps {
  value: string        // 'yyyy-MM-dd' 或 ''
  min?: string         // 'yyyy-MM-dd'
  onChange: (value: string) => void
  hasError?: boolean
}

// 星期标题
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

// 格式化为两位
function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// 获取指定年月的最大天数
function getMaxDay(y: number, m: number): number {
  return new Date(y, m, 0).getDate()
}

// 获取某月第一天是星期几（0=日）
function getFirstDayOfWeek(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay()
}

export function CustomDateInput({ value, min, onChange, hasError }: CustomDateInputProps) {
  const yearRef  = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef   = useRef<HTMLInputElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

  const [year,  setYear]  = useState(value ? value.slice(0, 4) : '')
  const [month, setMonth] = useState(value ? value.slice(5, 7) : '')
  const [day,   setDay]   = useState(value ? value.slice(8, 10) : '')

  // 日历弹窗状态
  const [showPicker, setShowPicker] = useState(false)
  const today = new Date()
  const [pickerYear, setPickerYear]   = useState(today.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(today.getMonth() + 1)

  const internalRef = useRef(false)

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current = false
      return
    }
    if (!value) {
      setYear(''); setMonth(''); setDay('')
    } else {
      setYear(value.slice(0, 4))
      setMonth(value.slice(5, 7))
      setDay(value.slice(8, 10))
    }
  }, [value])

  // 点击外部关闭日历
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function getMaxDayStr(y: string, m: string): number {
    const yi = parseInt(y, 10)
    const mi = parseInt(m, 10)
    if (!yi || !mi) return 31
    return getMaxDay(yi, mi)
  }

  function notify(y: string, m: string, d: string) {
    internalRef.current = true
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
    if (v.length === 4) monthRef.current?.focus()
  }

  function handleMonth(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2)
    if (v.length === 2 && parseInt(v, 10) > 12) v = '12'
    if (v.length === 1 && parseInt(v, 10) > 1) v = '0' + v
    setMonth(v)
    notify(year, v, day)
    if (v.length === 2) dayRef.current?.focus()
  }

  function handleDay(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2)
    const max = getMaxDayStr(year, month)
    if (v.length === 2 && parseInt(v, 10) > max) v = String(max)
    if (v.length === 1 && parseInt(v, 10) > 3) v = '0' + v
    setDay(v)
    notify(year, month, v)
  }

  function handleMonthKey(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && month === '') yearRef.current?.focus()
  }
  function handleDayKey(e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && day === '') monthRef.current?.focus()
  }

  // ─── 日历弹窗逻辑 ──────────────────────────────────────────────

  function openPicker() {
    // 打开时定位到当前已输入的年月，否则用今天
    const y = parseInt(year, 10)
    const m = parseInt(month, 10)
    setPickerYear(y >= 2000 ? y : today.getFullYear())
    setPickerMonth(m >= 1 && m <= 12 ? m : today.getMonth() + 1)
    setShowPicker(true)
  }

  function prevMonth() {
    if (pickerMonth === 1) {
      setPickerYear(pickerYear - 1)
      setPickerMonth(12)
    } else {
      setPickerMonth(pickerMonth - 1)
    }
  }

  function nextMonth() {
    if (pickerMonth === 12) {
      setPickerYear(pickerYear + 1)
      setPickerMonth(1)
    } else {
      setPickerMonth(pickerMonth + 1)
    }
  }

  function selectDate(d: number) {
    const yStr = String(pickerYear)
    const mStr = pad2(pickerMonth)
    const dStr = pad2(d)
    setYear(yStr)
    setMonth(mStr)
    setDay(dStr)
    internalRef.current = true
    onChange(`${yStr}-${mStr}-${dStr}`)
    setShowPicker(false)
  }

  // 生成日历网格
  function renderCalendar() {
    const maxDay = getMaxDay(pickerYear, pickerMonth)
    const firstDow = getFirstDayOfWeek(pickerYear, pickerMonth)
    const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

    const cells: (number | null)[] = []
    // 前面的空白
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= maxDay; d++) cells.push(d)

    return cells.map((d, i) => {
      if (d === null) {
        return <div key={`empty-${i}`} />
      }
      const dateStr = `${pickerYear}-${pad2(pickerMonth)}-${pad2(d)}`
      const isToday = dateStr === todayStr
      const isSelected = dateStr === value
      const isPast = min && dateStr < min

      return (
        <button
          key={d}
          type="button"
          disabled={!!isPast}
          onClick={() => selectDate(d)}
          className={
            'w-8 h-8 rounded-lg text-xs transition-colors flex items-center justify-center ' +
            (isPast
              ? 'text-white/15 cursor-default'
              : isSelected
                ? 'bg-violet-500 text-white font-bold'
                : isToday
                  ? 'bg-white/10 text-violet-400 font-medium hover:bg-violet-500/30'
                  : 'text-white/70 hover:bg-white/10')
          }
        >
          {d}
        </button>
      )
    })
  }

  const borderClass = hasError
    ? 'border-red-500 focus-within:border-red-400'
    : 'border-white/10 focus-within:border-violet-500'

  const inputClass =
    'bg-transparent text-white outline-none text-sm placeholder-white/25 text-center'

  return (
    <div ref={wrapRef} className="relative">
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

        {/* 日历图标按钮 */}
        <button
          type="button"
          onClick={openPicker}
          className="ml-auto flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-violet-400 hover:bg-white/10 transition-colors"
          aria-label="打开日历"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 7H15" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 日历弹窗 */}
      {showPicker && (
        <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 z-50 shadow-2xl shadow-black/50 w-[280px]">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-sm font-medium text-white">
              {pickerYear} 年 {pickerMonth} 月
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map(w => (
              <div key={w} className="w-8 h-6 flex items-center justify-center text-xs text-white/30">
                {w}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-0.5">
            {renderCalendar()}
          </div>

          {/* 快捷：今天 */}
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setPickerYear(today.getFullYear())
                setPickerMonth(today.getMonth() + 1)
                selectDate(today.getDate())
              }}
              className="text-xs text-white/40 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
