import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useTodoStore, selectEditingTodo } from '../store/todoStore'
import { CATEGORIES, PRIORITIES, CATEGORY_LABELS, PRIORITY_LABELS } from '../types/todo'
import type { Category, Priority } from '../types/todo'
import { CustomSelect } from './CustomSelect'

interface FormValues {
  title: string
  description: string
  dueDate: string
  priority: Priority
  category: Category
}

interface FormErrors {
  title?: string
  dueDate?: string
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

const DEFAULT_FORM: FormValues = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  category: 'work',
}

export function AddTodo() {
  const addTodo = useTodoStore(s => s.addTodo)
  const updateTodo = useTodoStore(s => s.updateTodo)
  const setEditingId = useTodoStore(s => s.setEditingId)
  const editingTodo = useTodoStore(selectEditingTodo)
  const isEditing = editingTodo !== null

  const [form, setForm] = useState<FormValues>(DEFAULT_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // 进入编辑模式时填充表单
  useEffect(() => {
    if (editingTodo) {
      setForm({
        title: editingTodo.title,
        description: editingTodo.description,
        dueDate: editingTodo.dueDate,
        priority: editingTodo.priority,
        category: editingTodo.category,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setErrors({})
    setSubmitted(false)
  }, [editingTodo])

  function validate(values: FormValues): FormErrors {
    const errs: FormErrors = {}
    if (!values.title.trim()) {
      errs.title = '标题不能为空'
    } else if (values.title.trim().length > 100) {
      errs.title = '标题不能超过 100 个字符'
    }
    if (!values.dueDate) {
      errs.dueDate = '截止日期不能为空'
    }
    return errs
  }

  function handleChange<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...form, [key]: value }
    setForm(next)
    if (submitted) setErrors(validate(next))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      category: form.category,
    }
    if (isEditing && editingTodo) {
      updateTodo(editingTodo.id, payload)
      setEditingId(null)
    } else {
      addTodo(payload)
    }
    setForm(DEFAULT_FORM)
    setErrors({})
    setSubmitted(false)
  }

  function handleCancel() {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* 标题栏 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
          {isEditing ? '✎' : '+'}
        </div>
        <h2 className="text-lg font-semibold text-white">
          {isEditing ? '编辑任务' : '新建任务'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            标题 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="任务标题"
            maxLength={100}
            className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-white/30
              outline-none transition-colors
              ${errors.title
                ? 'border-red-500 focus:border-red-400'
                : 'border-white/10 focus:border-violet-500'}`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-400">{errors.title}</p>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">描述</label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="任务描述（选填）"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white
              placeholder-white/30 outline-none focus:border-violet-500 transition-colors resize-none"
          />
        </div>

        {/* 截止日期 */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            截止日期 <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.dueDate}
            min={TODAY}
            onChange={e => handleChange('dueDate', e.target.value)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white
              outline-none transition-colors [color-scheme:dark]
              ${errors.dueDate
                ? 'border-red-500 focus:border-red-400'
                : 'border-white/10 focus:border-violet-500'}`}
          />
          {errors.dueDate && (
            <p className="mt-1.5 text-xs text-red-400">{errors.dueDate}</p>
          )}
        </div>

        {/* 优先级 + 分类 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">优先级</label>
            <CustomSelect
              value={form.priority}
              options={PRIORITIES.map(p => ({ value: p, label: PRIORITY_LABELS[p] }))}
              onChange={v => handleChange('priority', v as Priority)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">分类</label>
            <CustomSelect
              value={form.category}
              options={CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] }))}
              onChange={v => handleChange('category', v as Category)}
            />
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-violet-600 to-blue-600
              hover:from-violet-500 hover:to-blue-500
              transition-all duration-200"
          >
            {isEditing ? '保存修改' : '添加任务'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white/60
                border border-white/10 hover:border-white/30 hover:text-white/90
                transition-all duration-200"
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
