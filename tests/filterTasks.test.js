import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ALL_PRIORITIES, ALL_STATUSES, filterTasks, hasActiveFilters } from '../src/utils/filterTasks.js'

const { tasks } = JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'))
const ids = (list) => list.map((task) => task.id)

test('fără filtre sunt afișate toate sarcinile', () => {
  assert.equal(filterTasks(tasks).length, tasks.length)
})

test('filtrul după prioritate returnează doar prioritatea aleasă', () => {
  assert.deepEqual(ids(filterTasks(tasks, { priority: 'High' })), [1, 3, 7])
  assert.deepEqual(ids(filterTasks(tasks, { priority: 'Medium' })), [2, 5])
  assert.deepEqual(ids(filterTasks(tasks, { priority: 'Low' })), [4, 6])
  assert.equal(filterTasks(tasks, { priority: ALL_PRIORITIES }).length, tasks.length)
})

test('statusul "In progress" găsește sarcinile corespunzătoare', () => {
  assert.deepEqual(ids(filterTasks(tasks, { status: 'In progress' })), [1, 6])
})

test('prioritatea se combină cu statusul (AND)', () => {
  assert.deepEqual(ids(filterTasks(tasks, { status: 'To do', priority: 'High' })), [7])
  assert.deepEqual(ids(filterTasks(tasks, { status: 'In progress', priority: 'Low' })), [6])
})

test('prioritatea se combină cu căutarea', () => {
  assert.deepEqual(ids(filterTasks(tasks, { search: 'irina', priority: 'High' })), [3, 7])
  assert.deepEqual(ids(filterTasks(tasks, { search: 'ana', status: 'Done', priority: 'Medium' })), [5])
})

test('căutarea după persoană nu ține cont de majuscule și spații', () => {
  assert.deepEqual(ids(filterTasks(tasks, { search: '  MIHAI ' })), [2, 6])
})

test('lipsa rezultatelor returnează listă goală', () => {
  assert.deepEqual(filterTasks(tasks, { status: 'Done', priority: 'High' }), [])
})

test('câmpurile lipsă nu blochează căutarea', () => {
  const partial = [{ id: 99, title: 'Fără persoană', status: 'To do', priority: 'Low' }]
  assert.deepEqual(ids(filterTasks(partial, { search: 'persoană' })), [99])
  assert.deepEqual(filterTasks(partial, { search: 'ana' }), [])
})

test('hasActiveFilters detectează filtrele active pentru butonul de resetare', () => {
  assert.equal(hasActiveFilters({ search: '', status: ALL_STATUSES, priority: ALL_PRIORITIES }), false)
  assert.equal(hasActiveFilters({ search: '   ' }), false)
  assert.equal(hasActiveFilters({ priority: 'Low' }), true)
  assert.equal(hasActiveFilters({ status: 'Done' }), true)
  assert.equal(hasActiveFilters({ search: 'ana' }), true)
})
