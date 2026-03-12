import { useTodoStore } from '../store/todoStore'

export function StatsPanel() {
  const todos = useTodoStore(s => s.todos)

  // 实时计算统计，不依赖 selectStats selector（避免 useSyncExternalStore 引用不稳定问题）
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const pending = total - completed
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
          📊
        </div>
        <h2 className="text-lg font-semibold text-white">统计</h2>
      </div>

      {/* 四格数据 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-white/40 mt-1">总任务</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{pending}</p>
          <p className="text-xs text-white/40 mt-1">待完成</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          <p className="text-xs text-white/40 mt-1">已完成</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-violet-400">{completionRate}%</p>
          <p className="text-xs text-white/40 mt-1">完成率</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
