import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Flag, RotateCcw, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import SectionHeading from '../components/SectionHeading'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { ALL_PRIORITIES, ALL_STATUSES, PRIORITIES, filterTasks, hasActiveFilters } from '../utils/filterTasks'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(ALL_STATUSES)
  const [priority, setPriority] = useState(ALL_PRIORITIES)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getTasks(), api.getProjects()])
      .then(([taskData, projectData]) => { setTasks(taskData); setProjects(projectData) })
      .catch(() => setError('We could not load tasks. Check that the API is running.'))
      .finally(() => setLoading(false))
  }, [])

  const filteredTasks = useMemo(() => filterTasks(tasks, { search, status, priority }), [tasks, search, status, priority])
  const filtersActive = hasActiveFilters({ search, status, priority })

  function resetFilters() {
    setSearch('')
    setStatus(ALL_STATUSES)
    setPriority(ALL_PRIORITIES)
  }

  return (
    <div className="page-content">
      <SectionHeading eyebrow="YOUR WORKSPACE" title="All tasks" description="Keep track of the details that move your projects forward." action="Create task" to="/tasks/new" />
      <div className="task-summary-strip"><div className="summary-icon"><ListTodo size={19} /></div><div><strong>{tasks.length} tasks in your workspace</strong><span>Stay focused on what matters most.</span></div><div className="summary-spacer" /><span className="summary-completed">{tasks.filter(t => t.status === 'Done').length} completed</span></div>
      <div className="card tasks-card">
        <div className="task-toolbar">
          <div className="search-wrap"><Search size={17} /><input aria-label="Search tasks" placeholder="Search tasks or people..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="filter-wrap"><SlidersHorizontal size={16} /><label htmlFor="status-filter" className="sr-only">Filter by status</label><select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}><option value={ALL_STATUSES}>All status</option><option>To do</option><option>In progress</option><option>Review</option><option>Done</option></select></div>
          <div className="filter-wrap"><Flag size={16} /><label htmlFor="priority-filter" className="sr-only">Filter by priority</label><select id="priority-filter" value={priority} onChange={(e) => setPriority(e.target.value)}><option value={ALL_PRIORITIES}>All priorities</option>{PRIORITIES.map((level) => <option key={level} value={level}>{level}</option>)}</select></div>
          {filtersActive && <button type="button" className="button button-ghost reset-filters" onClick={resetFilters}><RotateCcw size={14} />Reset filters</button>}
        </div>
        {error && <div className="form-error">{error}</div>}
        {loading ? <div className="loading-state">Loading tasks…</div> : <div className="table-wrap"><table className="tasks-table"><thead><tr><th>Task name</th><th>Assignee</th><th>Due date</th><th>Priority</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>
          {filteredTasks.map((task) => <tr key={task.id}><td><Link to={`/tasks/${task.id}`} className="table-task-title"><span className={`table-task-icon ${task.status === 'Done' ? 'task-icon-done' : ''}`}>{task.status === 'Done' ? '✓' : '↗'}</span><span><strong>{task.title}</strong><small>{projects.find((p) => p.id === task.projectId)?.name || 'Unassigned'}</small></span></Link></td><td><span className="assignee-cell"><span className="mini-avatar">{(task.assignee || '?').split(' ').map(s => s[0]).join('').slice(0,2)}</span>{task.assignee || 'Unassigned'}</span></td><td className="date-cell">{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td><td><PriorityBadge priority={task.priority} /></td><td><StatusBadge status={task.status} /></td><td><Link to={`/tasks/${task.id}`} className="row-open" aria-label={`Open ${task.title}`}>↗</Link></td></tr>)}
        </tbody></table>
        {filteredTasks.length === 0 && !error && <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><strong>No tasks found</strong><p>{filtersActive ? 'Try another search or adjust your filters.' : 'Create your first task to get started.'}</p>{filtersActive && <button type="button" className="button button-ghost" onClick={resetFilters}>Clear filters</button>}</div>}
        </div>}
        <div className="table-footer"><span aria-live="polite">Showing {filteredTasks.length} of {tasks.length} tasks</span><span>Updated just now</span></div>
      </div>
    </div>
  )
}
