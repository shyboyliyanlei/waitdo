import { useTodoStore } from '../store/todoStore'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../types/todo'
import type { Todo } from '../types/todo'

// 优先级权重（用于排序）
const PRIORITY_WEIGHT: Record<Todo['priority'], number> = { high: 3, medium: 2, low: 1 }

// 优先级徽章样式
const PRIORITY_STYLES: Record<Todo['priority'], string> = {
  high: 'text-red-400 bg-red-400/10 border border-red-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  low: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
}

// 分类徽章样式
const CATEGORY_STYLES: Record<Todo['category'], string> = {
  work: 'text-blue-400 bg-blue-400/10',
  study: 'text-violet-400 bg-violet-400/10',
  life: 'text-emerald-400 bg-emerald-400/10',
  entertainment: 'text-pink-400 bg-pink-400/10',
}

// 获取今日日期字符串（格式 yyyy-MM-dd），用于判断逾期
function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TodoList() {
  const todos = useTodoStore(s => s.todos)
  const filter = useTodoStore(s => s.filter)
  const toggleTodo = useTodoStore(s => s.toggleTodo)
  const deleteTodo = useTodoStore(s => s.deleteTodo)
  const setEditingId = useTodoStore(s => s.setEditingId)

  const today = getTodayStr()

  // 内联筛选+排序（不使用 selectFilteredTodos selector，避免 Zustand v5 useSyncExternalStore 引用不稳定导致崩溃）
  const filtered = todos
    .filter(t => {
      if (filter.search.trim()) {
        if (!t.title.toLowerCase().includes(filter.search.trim().toLowerCase())) return false
      }
      if (filter.category !== 'all' && t.category !== filter.category) return false
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.status === 'completed' && !t.completed) return false
      if (filter.status === 'pending' && t.completed) return false
      return true
    })
    .sort((a, b) => {
      const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
      if (diff !== 0) return diff
      return b.createdAt.localeCompare(a.createdAt)
    })

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm">
          {todos.length === 0 ? '还没有任务，在左侧添加一个吧' : '没有符合筛选条件的任务'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filtered.map(todo => {
        const isOverdue = !todo.completed && todo.dueDate < today

        return (
          <div
            key={todo.id}
            className={
              'bg-white/5 border rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.07] ' +
              (todo.completed ? 'border-white/5 opacity-60' : 'border-white/10')
            }
          >
            <div className="flex items-start gap-3">
              {/* 完成切换按钮 */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 ' +
                  'flex items-center justify-center ' +
                  (todo.completed
                    ? 'bg-gradient-to-br from-violet-500 to-blue-500 border-transparent'
                    : 'border-white/30 hover:border-violet-400')
                }
                aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
              >
                {todo.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* 内容区域 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  {/* 标题 */}
                  <h3
                    className={
                      'font-medium text-sm leading-snug break-words ' +
                      (todo.completed ? 'line-through text-white/40' : 'text-white')
                    }
                  >
                    {todo.title}
                  </h3>

                  {/* 操作按钮 */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(todo.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
                      aria-label="编辑"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
                      aria-label="删除"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 描述 */}
                {todo.description && (
                  <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">
                    {todo.description}
                  </p>
                )}

                {/* 元信息行 */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* 截止日期 */}
                  <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-white/40'}`}>
                    {isOverdue ? '⚠ 逾期 ' : ''}
                    {todo.dueDate}
                  </span>

                  {/* 优先级徽章 */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[todo.priority]}`}>
                    {PRIORITY_LABELS[todo.priority]}
                  </span>

                  {/* 分类徽章 */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[todo.category]}`}>
                    {CATEGORY_LABELS[todo.category]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
