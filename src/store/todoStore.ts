import { create } from 'zustand'
import {
  loadTodos,
  createTodo as storageCreate,
  updateTodo as storageUpdate,
  deleteTodo as storageDelete,
  toggleTodo as storageToggle,
} from '../data/storage'
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter, TodoStats } from '../types/todo'

// ─── 默认筛选条件 ─────────────────────────────────────────────────────────────

export const DEFAULT_FILTER: TodoFilter = {
  search: '',
  category: 'all',
  priority: 'all',
  status: 'all',
}

// ─── 纯函数：筛选+排序（不依赖 LocalStorage，供 selector 使用）────────────────

const PRIORITY_WEIGHT: Record<Todo['priority'], number> = {
  high: 3,
  medium: 2,
  low: 1,
}

function applyFilter(todos: Todo[], filter: TodoFilter): Todo[] {
  return todos
    .filter(todo => {
      // 关键词搜索（不区分大小写，匹配标题）
      if (filter.search.trim()) {
        const keyword = filter.search.trim().toLowerCase()
        if (!todo.title.toLowerCase().includes(keyword)) return false
      }

      // 分类筛选
      if (filter.category !== 'all' && todo.category !== filter.category) return false

      // 优先级筛选
      if (filter.priority !== 'all' && todo.priority !== filter.priority) return false

      // 状态筛选
      if (filter.status === 'completed' && !todo.completed) return false
      if (filter.status === 'pending' && todo.completed) return false

      return true
    })
    .sort((a, b) => {
      // 主排序：优先级降序（高→中→低）
      const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      // 次排序：创建时间降序（最新在前）
      return b.createdAt.localeCompare(a.createdAt)
    })
}

function computeStats(todos: Todo[]): TodoStats {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const pending = total - completed
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, pending, completionRate }
}

// ─── Store 类型定义 ───────────────────────────────────────────────────────────

interface TodoStore {
  // 状态
  todos: Todo[]
  filter: TodoFilter
  editingId: string | null  // null 表示新建模式，有值表示编辑模式

  // Todo 操作
  addTodo: (input: CreateTodoInput) => void
  updateTodo: (id: string, updates: UpdateTodoInput) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void

  // 筛选操作
  setFilter: (patch: Partial<TodoFilter>) => void
  resetFilter: () => void

  // 编辑状态操作
  setEditingId: (id: string | null) => void
}

// ─── Store 实例 ───────────────────────────────────────────────────────────────

export const useTodoStore = create<TodoStore>((set) => ({
  // 初始化：从 LocalStorage 加载数据
  todos: loadTodos(),
  filter: DEFAULT_FILTER,
  editingId: null,

  // 添加待办（存储层持久化，返回新 Todo 后追加到内存）
  addTodo: (input) => {
    const newTodo = storageCreate(input)
    set(state => ({ todos: [...state.todos, newTodo] }))
  },

  // 更新待办（不可变替换对应条目）
  updateTodo: (id, updates) => {
    const updatedTodo = storageUpdate(id, updates)
    set(state => ({
      todos: state.todos.map(t => (t.id === id ? updatedTodo : t)),
    }))
  },

  // 删除待办（过滤掉对应条目；若正在编辑该条目，退出编辑模式）
  deleteTodo: (id) => {
    storageDelete(id)
    set(state => ({
      todos: state.todos.filter(t => t.id !== id),
      editingId: state.editingId === id ? null : state.editingId,
    }))
  },

  // 切换完成状态
  toggleTodo: (id) => {
    const updatedTodo = storageToggle(id)
    set(state => ({
      todos: state.todos.map(t => (t.id === id ? updatedTodo : t)),
    }))
  },

  // 部分更新筛选条件（合并 patch，保留其他字段）
  setFilter: (patch) => {
    set(state => ({
      filter: { ...state.filter, ...patch },
    }))
  },

  // 重置为默认筛选条件
  resetFilter: () => {
    set({ filter: DEFAULT_FILTER })
  },

  // 设置编辑中的 Todo ID（null = 退出编辑/新建模式）
  setEditingId: (id) => {
    set({ editingId: id })
  },
}))

// ─── Selectors（组件通过 useTodoStore(selector) 调用，避免不必要重渲染）────────

/** 根据当前 filter 过滤并排序后的待办列表 */
export const selectFilteredTodos = (state: TodoStore): Todo[] =>
  applyFilter(state.todos, state.filter)

/** 全量统计数据（不受筛选影响） */
export const selectStats = (state: TodoStore): TodoStats =>
  computeStats(state.todos)

/** 当前正在编辑的 Todo 对象（找不到时返回 null） */
export const selectEditingTodo = (state: TodoStore): Todo | null =>
  state.editingId ? (state.todos.find(t => t.id === state.editingId) ?? null) : null

/** 是否有任何筛选条件处于激活状态（用于显示"重置"按钮） */
export const selectIsFilterActive = (state: TodoStore): boolean =>
  state.filter.search !== DEFAULT_FILTER.search ||
  state.filter.category !== DEFAULT_FILTER.category ||
  state.filter.priority !== DEFAULT_FILTER.priority ||
  state.filter.status !== DEFAULT_FILTER.status
