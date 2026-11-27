export const ALL_STATUSES = 'All status'
export const ALL_PRIORITIES = 'All priorities'
export const PRIORITIES = ['Low', 'Medium', 'High']

/**
 * Filtrează sarcinile după text (titlu sau persoană), status și prioritate.
 * Toate criteriile se aplică simultan (AND), deci niciun filtru nu îl anulează pe altul.
 */
export function filterTasks(tasks, { search = '', status = ALL_STATUSES, priority = ALL_PRIORITIES } = {}) {
  const query = search.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch = !query
      || (task.title || '').toLowerCase().includes(query)
      || (task.assignee || '').toLowerCase().includes(query)
    const matchesStatus = status === ALL_STATUSES || task.status === status
    const matchesPriority = priority === ALL_PRIORITIES || task.priority === priority
    return matchesSearch && matchesStatus && matchesPriority
  })
}

export function hasActiveFilters({ search = '', status = ALL_STATUSES, priority = ALL_PRIORITIES } = {}) {
  return search.trim() !== '' || status !== ALL_STATUSES || priority !== ALL_PRIORITIES
}
