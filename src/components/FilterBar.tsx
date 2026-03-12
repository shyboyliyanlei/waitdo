import { useTodoStore, DEFAULT_FILTER } from '../store/todoStore'
import { CATEGORIES, PRIORITIES, CATEGORY_LABELS, PRIORITY_LABELS } from '../types/todo'
import type { Category, Priority, TodoFilter } from '../types/todo'
import { CustomSelect } from './CustomSelect'

export function FilterBar() {
  const filter = useTodoStore(s => s.filter)
  const setFilter = useTodoStore(s => s.setFilter)
  const resetFilter = useTodoStore(s => s.resetFilter)

  const isActive =
    filter.search !== DEFAULT_FILTER.search ||
    filter.category !== DEFAULT_FILTER.category ||
    filter.priority !== DEFAULT_FILTER.priority ||
    filter.status !== DEFAULT_FILTER.status

  const priorityOptions = [
    { value: 'all', label: '全部优先级' },
    ...PRIORITIES.map(p => ({ value: p, label: `${PRIORITY_LABELS[p]}优先级` })),
  ]

  const statusOptions: { value: TodoFilter['status']; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待完成' },
    { value: 'completed', label: '已完成' },
  ]

  const categoryOptions = [
    { value: 'all', label: '全部分类' },
    ...CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] })),
  ]

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 优先级筛选 */}
        <CustomSelect
          value={filter.priority}
          options={priorityOptions}
          onChange={v => setFilter({ priority: v as Priority | 'all' })}
        />

        {/* 状态筛选 */}
        <CustomSelect
          value={filter.status}
          options={statusOptions}
          onChange={v => setFilter({ status: v as TodoFilter['status'] })}
        />

        {/* 分类筛选 */}
        <CustomSelect
          value={filter.category}
          options={categoryOptions}
          onChange={v => setFilter({ category: v as Category | 'all' })}
        />

        {/* 关键词搜索 */}
        <input
          type="text"
          value={filter.search}
          onChange={e => setFilter({ search: e.target.value })}
          placeholder="搜索标题…"
          className={
            'w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white ' +
            'placeholder-white/30 outline-none focus:border-violet-500 hover:border-white/30 transition-colors'
          }
        />
      </div>

      {isActive && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={resetFilter}
            className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            重置筛选
          </button>
        </div>
      )}
    </div>
  )
}
