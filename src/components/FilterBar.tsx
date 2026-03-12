import { useTodoStore, DEFAULT_FILTER } from '../store/todoStore'
import { CATEGORIES, PRIORITIES, CATEGORY_LABELS, PRIORITY_LABELS } from '../types/todo'
import type { Category, Priority, TodoFilter } from '../types/todo'

export function FilterBar() {
  const filter = useTodoStore(s => s.filter)
  const setFilter = useTodoStore(s => s.setFilter)
  const resetFilter = useTodoStore(s => s.resetFilter)

  // 判断是否有任何筛选条件激活
  const isActive =
    filter.search !== DEFAULT_FILTER.search ||
    filter.category !== DEFAULT_FILTER.category ||
    filter.priority !== DEFAULT_FILTER.priority ||
    filter.status !== DEFAULT_FILTER.status

  const selectClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white ' +
    'outline-none focus:border-violet-500 transition-colors [color-scheme:dark] cursor-pointer'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 优先级筛选 */}
        <select
          value={filter.priority}
          onChange={e => setFilter({ priority: e.target.value as Priority | 'all' })}
          className={selectClass}
        >
          <option value="all">全部优先级</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}优先级</option>
          ))}
        </select>

        {/* 状态筛选 */}
        <select
          value={filter.status}
          onChange={e => setFilter({ status: e.target.value as TodoFilter['status'] })}
          className={selectClass}
        >
          <option value="all">全部状态</option>
          <option value="pending">待完成</option>
          <option value="completed">已完成</option>
        </select>

        {/* 分类筛选 */}
        <select
          value={filter.category}
          onChange={e => setFilter({ category: e.target.value as Category | 'all' })}
          className={selectClass}
        >
          <option value="all">全部分类</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        {/* 关键词搜索 */}
        <input
          type="text"
          value={filter.search}
          onChange={e => setFilter({ search: e.target.value })}
          placeholder="搜索标题…"
          className={
            'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white ' +
            'placeholder-white/30 outline-none focus:border-violet-500 transition-colors'
          }
        />
      </div>

      {/* 重置按钮 */}
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
