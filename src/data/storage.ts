import { format, parseISO } from 'date-fns'
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter, TodoStats } from '../types/todo'

// LocalStorage 键名常量，集中管理
const STORAGE_KEY = 'waitdo_todos'

// 优先级排序权重（高优先级排在前面）
const PRIORITY_WEIGHT: Record<Todo['priority'], number> = {
  high: 3,
  medium: 2,
  low: 1,
}

// ─── 内部工具（不导出）──────────────────────────────────────────────────────

/**
 * 将待办列表写入 LocalStorage（完整替换，不可变写入）
 */
function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    // LocalStorage 可能因容量限制（5MB）失败
    console.error('[storage] 写入 LocalStorage 失败', error)
    throw new Error('保存失败，本地存储空间可能不足')
  }
}

// ─── 基础读取 ────────────────────────────────────────────────────────────────

/**
 * 从 LocalStorage 读取所有待办事项。
 * 若数据损坏或不存在，返回空数组（容错处理）。
 */
export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Todo[]
  } catch {
    console.error('[storage] 解析 LocalStorage 数据失败，返回空数组')
    return []
  }
}

// ─── CRUD 操作 ───────────────────────────────────────────────────────────────

/**
 * 创建新待办事项，自动生成 id 和 createdAt，completed 默认 false。
 * 返回完整的 Todo 对象。
 */
export function createTodo(input: CreateTodoInput): Todo {
  if (!input.title.trim()) {
    throw new Error('标题不能为空')
  }
  if (!input.dueDate) {
    throw new Error('截止日期不能为空')
  }

  const newTodo: Todo = {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    id: crypto.randomUUID(),          // Web Crypto API，浏览器原生支持
    completed: false,
    createdAt: new Date().toISOString(),
  }

  // 不可变：创建新数组追加条目
  saveTodos([...loadTodos(), newTodo])
  return newTodo
}

/**
 * 根据 id 查询单个待办事项。未找到返回 undefined。
 */
export function getTodoById(id: string): Todo | undefined {
  return loadTodos().find(todo => todo.id === id)
}

/**
 * 部分更新指定 id 的待办事项（不可变）。
 * id 和 createdAt 不允许被覆盖。若 id 不存在，抛出错误。
 */
export function updateTodo(id: string, updates: UpdateTodoInput): Todo {
  const todos = loadTodos()
  const index = todos.findIndex(todo => todo.id === id)

  if (index === -1) {
    throw new Error(`待办事项不存在：${id}`)
  }

  const original = todos[index]
  // 不可变更新：合并字段，保护 id 和 createdAt
  const updatedTodo: Todo = {
    ...original,
    ...updates,
    id: original.id,
    createdAt: original.createdAt,
  }

  // 不可变：创建新数组替换对应条目
  const updatedTodos = todos.map((todo, i) => (i === index ? updatedTodo : todo))
  saveTodos(updatedTodos)
  return updatedTodo
}

/**
 * 切换待办事项的完成状态（toggleTodo 是 updateTodo 的语义化快捷方式）。
 */
export function toggleTodo(id: string): Todo {
  const todo = getTodoById(id)
  if (!todo) {
    throw new Error(`待办事项不存在：${id}`)
  }
  return updateTodo(id, { completed: !todo.completed })
}

/**
 * 删除指定 id 的待办事项。
 * 幂等操作：id 不存在时静默成功，不抛出错误。
 */
export function deleteTodo(id: string): void {
  const todos = loadTodos()
  // 不可变：过滤掉目标条目
  saveTodos(todos.filter(todo => todo.id !== id))
}

/**
 * 清空所有待办事项（危险操作，仅用于测试或重置）。
 */
export function clearAllTodos(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── 查询与筛选 ──────────────────────────────────────────────────────────────

/**
 * 根据筛选条件返回过滤+排序后的待办列表。
 * 排序规则：优先级降序（高→中→低），同优先级按创建时间降序（最新在前）。
 */
export function getFilteredTodos(filter: TodoFilter): Todo[] {
  const todos = loadTodos()

  return todos
    .filter(todo => {
      // 关键词搜索（不区分大小写，匹配 title）
      if (filter.search.trim()) {
        const keyword = filter.search.trim().toLowerCase()
        if (!todo.title.toLowerCase().includes(keyword)) return false
      }

      // 分类筛选
      if (filter.category !== 'all' && todo.category !== filter.category) {
        return false
      }

      // 优先级筛选
      if (filter.priority !== 'all' && todo.priority !== filter.priority) {
        return false
      }

      // 状态筛选
      if (filter.status === 'completed' && !todo.completed) return false
      if (filter.status === 'pending' && todo.completed) return false

      return true
    })
    .sort((a, b) => {
      // 主排序：优先级降序
      const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      // 次排序：创建时间降序
      return b.createdAt.localeCompare(a.createdAt)
    })
}

/**
 * 计算统计数据（基于全部数据，不受筛选条件影响，实时计算不缓存）。
 */
export function getTodoStats(): TodoStats {
  const todos = loadTodos()
  const total = todos.length
  const completed = todos.filter(todo => todo.completed).length
  const pending = total - completed
  // 避免除以零
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, pending, completionRate }
}

/**
 * 判断待办事项是否已逾期（截止日期早于今天，且未完成）。
 */
export function isTodoOverdue(todo: Todo): boolean {
  if (todo.completed) return false
  try {
    const dueStr = format(parseISO(todo.dueDate), 'yyyy-MM-dd')
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return dueStr < todayStr
  } catch {
    return false
  }
}
