import { useState, useEffect, useRef } from 'react'

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Other']
const PRIORITIES = ['low', 'medium', 'high']

const SEED_TODOS = [
  {
    id: 1, title: 'Buy groceries', description: 'Fruits, vegetables, dairy and bread.',
    priority: 'medium', dueDate: '2026-05-20', category: 'Shopping',
    notes: "Don't forget almond milk.", completed: false, createdAt: '2026-05-10',
  },
  {
    id: 2, title: 'Morning run', description: '5km jog in the park before breakfast.',
    priority: 'high', dueDate: '2026-05-15', category: 'Health',
    notes: 'Bring water bottle.', completed: true, createdAt: '2026-05-09',
  },
  {
    id: 3, title: 'Finish project report', description: 'Write the Q2 analysis and send to manager.',
    priority: 'high', dueDate: '2026-05-16', category: 'Work',
    notes: 'Include charts from the spreadsheet.', completed: false, createdAt: '2026-05-08',
  },
  {
    id: 4, title: 'Call dentist', description: 'Schedule a check-up appointment.',
    priority: 'low', dueDate: '2026-05-30', category: 'Health',
    notes: '', completed: false, createdAt: '2026-05-07',
  },
  {
    id: 5, title: 'Read book', description: 'Continue "Atomic Habits" — chapter 7 onwards.',
    priority: 'low', dueDate: '2026-06-01', category: 'Personal',
    notes: 'Take notes on habit stacking.', completed: false, createdAt: '2026-05-06',
  },
]

const EMPTY_FORM = { title: '', description: '', priority: 'medium', dueDate: '', category: 'Personal', notes: '' }

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }, [key, value])
  return [value, setValue]
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [animStep, setAnimStep] = useState(0) // 0=logo, 1=subtitle, 2=bar, 3=done
  const [todos, setTodos] = useLocalStorage('pw-todos', SEED_TODOS)
  const [detailTodo, setDetailTodo] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTodo, setEditTodo] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [toasts, setToasts] = useState([])
  const [darkMode, setDarkMode] = useLocalStorage('pw-dark', false)
  const nextId = useRef(Math.max(...SEED_TODOS.map(t => t.id)) + 1)

  // Welcome animation sequence
  useEffect(() => {
    const t1 = setTimeout(() => setAnimStep(1), 600)
    const t2 = setTimeout(() => setAnimStep(2), 1200)
    const t3 = setTimeout(() => setAnimStep(3), 2800)
    const t4 = setTimeout(() => setReady(true), 3400)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  function addToast(message, type = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setEditTodo(null); setShowAddModal(true) }
  function openEdit(todo, e) { e.stopPropagation(); setForm({ title: todo.title, description: todo.description, priority: todo.priority, dueDate: todo.dueDate, category: todo.category, notes: todo.notes }); setFormErrors({}); setEditTodo(todo); setShowAddModal(true) }

  function validateForm() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (form.title.trim().length > 80) errs.title = 'Title must be 80 chars or fewer'
    if (!form.dueDate) errs.dueDate = 'Due date is required'
    return errs
  }

  function submitForm() {
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    if (editTodo) {
      setTodos(prev => prev.map(t => t.id === editTodo.id ? { ...t, ...form } : t))
      setDetailTodo(prev => prev?.id === editTodo.id ? { ...prev, ...form } : prev)
      addToast('Task updated successfully')
    } else {
      const newTodo = { ...form, id: nextId.current++, completed: false, createdAt: new Date().toISOString().slice(0, 10) }
      setTodos(prev => [newTodo, ...prev])
      addToast('Task added successfully')
    }
    setShowAddModal(false)
  }

  function toggleComplete(id, e) {
    e.stopPropagation()
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    const todo = todos.find(t => t.id === id)
    addToast(todo.completed ? 'Task marked as active' : 'Task completed!', todo.completed ? 'info' : 'success')
  }

  function requestDelete(todo, e) { e.stopPropagation(); setConfirmDelete(todo) }

  function confirmDeleteAction() {
    setTodos(prev => prev.filter(t => t.id !== confirmDelete.id))
    if (detailTodo?.id === confirmDelete.id) setDetailTodo(null)
    addToast('Task deleted', 'error')
    setConfirmDelete(null)
  }

  const filtered = todos.filter(t => {
    if (filterStatus === 'active' && t.completed) return false
    if (filterStatus === 'completed' && !t.completed) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = { total: todos.length, completed: todos.filter(t => t.completed).length, active: todos.filter(t => !t.completed).length }

  return (
    <div className={`app${darkMode ? ' dark' : ''}`} data-testid="app">
      {/* Welcome overlay — blocks all interaction until animation ends */}
      {!ready && (
        <div className="welcome-overlay" data-testid="welcome-overlay" aria-label="Loading">
          <div className={`welcome-logo${animStep >= 0 ? ' visible' : ''}`} data-testid="welcome-logo">
            <span className="welcome-icon">✓</span>
          </div>
          <h1 className={`welcome-title${animStep >= 1 ? ' visible' : ''}`} data-testid="welcome-title">
            Todo App
          </h1>
          <p className={`welcome-sub${animStep >= 1 ? ' visible' : ''}`}>
            Stay organised. Get things done.
          </p>
          <div className={`welcome-bar-wrap${animStep >= 2 ? ' visible' : ''}`} data-testid="welcome-progress">
            <div className={`welcome-bar${animStep >= 2 ? ' fill' : ''}`} />
          </div>
          <p className={`welcome-ready${animStep >= 3 ? ' visible' : ''}`} data-testid="welcome-ready-text">
            Ready!
          </p>
        </div>
      )}

      {/* Main app — inert while overlay is showing */}
      <div className="main-wrap" inert={!ready ? '' : undefined} aria-hidden={!ready}>
        <header className="header" data-testid="header">
          <div className="header-left">
            <span className="header-icon">✓</span>
            <h1 className="header-title">Todo App</h1>
          </div>
          <div className="header-right">
            <div className="stats" data-testid="stats">
              <span data-testid="stat-total">{stats.total} total</span>
              <span className="stat-sep">·</span>
              <span data-testid="stat-active">{stats.active} active</span>
              <span className="stat-sep">·</span>
              <span data-testid="stat-completed">{stats.completed} done</span>
            </div>
            <button className="btn btn-ghost" onClick={() => setDarkMode(d => !d)} data-testid="theme-toggle" aria-label="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="toolbar" data-testid="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="search-input"
            aria-label="Search tasks"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} data-testid="filter-status" aria-label="Filter by status">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} data-testid="filter-priority" aria-label="Filter by priority">
            <option value="all">Any priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} data-testid="filter-category" aria-label="Filter by category">
            <option value="all">Any category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd} data-testid="add-todo-btn" aria-label="Add new task">
            + Add Task
          </button>
        </div>

        <main className="todo-list" data-testid="todo-list" role="list">
          {filtered.length === 0 && (
            <div className="empty-state" data-testid="empty-state">
              <p>No tasks match your filters.</p>
              <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterPriority('all'); setFilterStatus('all'); setFilterCategory('all') }} data-testid="clear-filters-btn">
                Clear filters
              </button>
            </div>
          )}
          {filtered.map(todo => (
            <div
              key={todo.id}
              className={`todo-card${todo.completed ? ' completed' : ''}${todo.priority === 'high' ? ' high-priority' : ''}`}
              onClick={() => setDetailTodo(todo)}
              role="listitem"
              data-testid={`todo-item-${todo.id}`}
              data-priority={todo.priority}
              data-completed={todo.completed}
              data-category={todo.category}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setDetailTodo(todo)}
              aria-label={`Task: ${todo.title}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => toggleComplete(todo.id, e)}
                onClick={e => e.stopPropagation()}
                data-testid={`checkbox-${todo.id}`}
                aria-label={`Mark ${todo.title} as ${todo.completed ? 'active' : 'completed'}`}
              />
              <div className="todo-body">
                <span className="todo-title" data-testid={`todo-title-${todo.id}`}>{todo.title}</span>
                <div className="todo-meta">
                  <span className={`badge badge-${todo.priority}`} data-testid={`priority-badge-${todo.id}`}>{todo.priority}</span>
                  <span className="badge badge-category" data-testid={`category-badge-${todo.id}`}>{todo.category}</span>
                  {todo.dueDate && <span className="due-date" data-testid={`due-date-${todo.id}`}>Due {todo.dueDate}</span>}
                </div>
              </div>
              <div className="todo-actions">
                <button className="btn btn-sm btn-ghost" onClick={e => openEdit(todo, e)} data-testid={`edit-btn-${todo.id}`} aria-label={`Edit ${todo.title}`}>✏️</button>
                <button className="btn btn-sm btn-danger" onClick={e => requestDelete(todo, e)} data-testid={`delete-btn-${todo.id}`} aria-label={`Delete ${todo.title}`}>🗑️</button>
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Detail modal */}
      {detailTodo && (
        <div className="modal-backdrop" onClick={() => setDetailTodo(null)} data-testid="detail-modal-backdrop">
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="detail-modal" role="dialog" aria-modal="true" aria-label={`Details: ${detailTodo.title}`}>
            <div className="modal-header">
              <h2 data-testid="detail-modal-title">{detailTodo.title}</h2>
              <button className="modal-close" onClick={() => setDetailTodo(null)} data-testid="detail-modal-close" aria-label="Close details">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-badges">
                <span className={`badge badge-${detailTodo.priority}`} data-testid="detail-priority">{detailTodo.priority} priority</span>
                <span className="badge badge-category" data-testid="detail-category">{detailTodo.category}</span>
                <span className={`badge ${detailTodo.completed ? 'badge-done' : 'badge-active'}`} data-testid="detail-status">
                  {detailTodo.completed ? 'Completed' : 'Active'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Description</strong>
                <p data-testid="detail-description">{detailTodo.description || '—'}</p>
              </div>
              <div className="detail-row">
                <strong>Due date</strong>
                <p data-testid="detail-due-date">{detailTodo.dueDate || '—'}</p>
              </div>
              <div className="detail-row">
                <strong>Created</strong>
                <p data-testid="detail-created-at">{detailTodo.createdAt}</p>
              </div>
              {detailTodo.notes && (
                <div className="detail-row">
                  <strong>Notes</strong>
                  <p data-testid="detail-notes">{detailTodo.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { openEdit(detailTodo, { stopPropagation: () => {} }); setDetailTodo(null) }} data-testid="detail-edit-btn">Edit</button>
              <button className="btn btn-danger" onClick={e => { requestDelete(detailTodo, e); setDetailTodo(null) }} data-testid="detail-delete-btn">Delete</button>
              <button className="btn btn-primary" onClick={() => setDetailTodo(null)} data-testid="detail-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)} data-testid="form-modal-backdrop">
          <div className="modal modal-form" onClick={e => e.stopPropagation()} data-testid="form-modal" role="dialog" aria-modal="true" aria-label={editTodo ? 'Edit task' : 'Add task'}>
            <div className="modal-header">
              <h2>{editTodo ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)} data-testid="form-modal-close" aria-label="Close form">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="field-title">Title <span className="required">*</span></label>
                <input
                  id="field-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                  data-testid="form-title"
                  aria-required="true"
                  aria-invalid={!!formErrors.title}
                  aria-describedby={formErrors.title ? 'title-error' : undefined}
                />
                {formErrors.title && <span className="field-error" id="title-error" data-testid="form-title-error">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="field-description">Description</label>
                <textarea
                  id="field-description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                  data-testid="form-description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="field-priority">Priority</label>
                  <select id="field-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} data-testid="form-priority">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="field-category">Category</label>
                  <select id="field-category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} data-testid="form-category">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="field-due-date">Due date <span className="required">*</span></label>
                  <input
                    id="field-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    data-testid="form-due-date"
                    aria-required="true"
                    aria-invalid={!!formErrors.dueDate}
                  />
                  {formErrors.dueDate && <span className="field-error" data-testid="form-due-date-error">{formErrors.dueDate}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="field-notes">Notes</label>
                <textarea
                  id="field-notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                  data-testid="form-notes"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)} data-testid="form-cancel-btn">Cancel</button>
              <button className="btn btn-primary" onClick={submitForm} data-testid="form-submit-btn">
                {editTodo ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal-backdrop" data-testid="confirm-modal-backdrop">
          <div className="modal modal-sm" data-testid="confirm-modal" role="alertdialog" aria-modal="true" aria-label="Confirm deletion">
            <div className="modal-header">
              <h2>Delete Task?</h2>
            </div>
            <div className="modal-body">
              <p data-testid="confirm-modal-text">
                Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)} data-testid="confirm-cancel-btn">Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteAction} data-testid="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="toast-container" data-testid="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} data-testid={`toast-${t.type}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}
