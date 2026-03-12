import { StatsPanel } from './components/StatsPanel'
import { AddTodo } from './components/AddTodo'
import { FilterBar } from './components/FilterBar'
import { TodoList } from './components/TodoList'

function App() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-white mb-6">
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            WaitDo
          </span>
          <span className="text-white/30 text-base font-normal ml-3">待办清单</span>
        </h1>

        {/* 主体：左右两栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* 左侧面板 */}
          <div className="space-y-4">
            <StatsPanel />
            <AddTodo />
          </div>

          {/* 右侧面板 */}
          <div className="space-y-4">
            <FilterBar />
            <TodoList />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
