// 分类类型：工作、学习、生活、娱乐
export type Category = 'work' | 'study' | 'life' | 'entertainment'

// 优先级类型：低、中、高
export type Priority = 'low' | 'medium' | 'high'

// 待办事项核心数据模型
export interface Todo {
  id: string
  title: string
  description: string
  category: Category
  priority: Priority
  dueDate: string     // ISO 8601 日期字符串，如 "2026-03-31"
  completed: boolean
  createdAt: string   // ISO 8601 datetime 字符串，如 "2026-03-12T08:00:00.000Z"
}

// 创建新待办的输入类型（id、createdAt、completed 由系统自动生成）
export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'completed'>

// 更新待办的输入类型（所有字段可选，id 和 createdAt 不可修改）
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt'>>

// 筛选条件类型（用于左侧筛选面板）
export interface TodoFilter {
  search: string
  category: Category | 'all'
  priority: Priority | 'all'
  status: 'all' | 'completed' | 'pending'
}

// 统计数据类型（用于左侧统计面板）
export interface TodoStats {
  total: number
  completed: number
  pending: number
  completionRate: number  // 0–100 的整数百分比
}

// 分类中文标签映射（集中维护，不硬编码在组件里）
export const CATEGORY_LABELS: Record<Category, string> = {
  work: '工作',
  study: '学习',
  life: '生活',
  entertainment: '娱乐',
}

// 优先级中文标签映射
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

// 分类列表（用于遍历渲染选项）
export const CATEGORIES: Category[] = ['work', 'study', 'life', 'entertainment']

// 优先级列表（用于遍历渲染选项）
export const PRIORITIES: Priority[] = ['low', 'medium', 'high']
