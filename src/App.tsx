
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Navbar from './components/Navbar'
import HabitItem from './components/HabitItem'
import type { Habit } from './types/Habit'
import './App.css'

const STORAGE_KEY = 'myhabits_data'

type Page = 'dashboard' | 'analytics' | 'settings'

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayDate() {
  return formatDate(new Date())
}

function getDateNumber(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24)
}

function getWeekDates(offset: number) {
  const today = new Date()
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  const dayFromMonday = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - dayFromMonday + offset * 7)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return formatDate(date)
  })
}

function getDisplayDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function calculateCurrentStreak(dates: string[]) {
  const uniqueDates = [...new Set(dates)].sort()

  if (uniqueDates.length === 0) return 0

  const today = getTodayDate()
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = formatDate(yesterdayDate)

  let currentDate = uniqueDates.includes(today) ? today : yesterday

  if (!uniqueDates.includes(currentDate)) return 0

  let streak = 0

  while (uniqueDates.includes(currentDate)) {
    streak++

    const previousDate = new Date(`${currentDate}T00:00:00`)
    previousDate.setDate(previousDate.getDate() - 1)
    currentDate = formatDate(previousDate)
  }

  return streak
}

function calculateLongestStreak(dates: string[]) {
  const uniqueDates = [...new Set(dates)].sort()

  if (uniqueDates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let index = 1; index < uniqueDates.length; index++) {
    const previous = getDateNumber(uniqueDates[index - 1])
    const currentDate = getDateNumber(uniqueDates[index])

    if (currentDate - previous === 1) {
      current++
    } else {
      current = 1
    }

    longest = Math.max(longest, current)
  }

  return longest
}

const defaultHabits: Habit[] = [
  {
    id: 1,
    name: 'Morning Exercise',
    description: '30 minutes of exercise',
    completedDates: [],
  },
  {
    id: 2,
    name: 'Read Books',
    description: 'Read at least 10 pages',
    completedDates: [],
  },
  {
    id: 3,
    name: 'Drink Water',
    description: 'Drink 8 glasses of water',
    completedDates: [],
  },
]

function loadHabits(): Habit[] {
  try {
    const savedHabits = localStorage.getItem(STORAGE_KEY)

    if (savedHabits) {
      const parsedHabits: unknown = JSON.parse(savedHabits)

      if (Array.isArray(parsedHabits)) {
        return parsedHabits.map((habit) => {
          const oldHabit = habit as {
            id: number
            name: string
            description: string
            completed?: boolean
            completedDates?: string[]
          }

          return {
            id: oldHabit.id,
            name: oldHabit.name,
            description: oldHabit.description,
            completedDates: Array.isArray(oldHabit.completedDates)
              ? oldHabit.completedDates
              : oldHabit.completed
                ? [getTodayDate()]
                : [],
          }
        })
      }
    }
  } catch {
    console.error('Could not load saved habits.')
  }

  return defaultHabits
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newNameError, setNewNameError] = useState('')

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editNameError, setEditNameError] = useState('')

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(getTodayDate())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  function toggleHabit(id: number) {
    const today = getTodayDate()

    setHabits((previous) =>
      previous.map((habit) => {
        if (habit.id !== id) return habit

        const alreadyCompleted = habit.completedDates.includes(today)

        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter((date) => date !== today)
            : [...habit.completedDates, today],
        }
      }),
    )
  }

  function addHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = newName.trim()

    if (!trimmedName) {
      setNewNameError('Please enter a habit name.')
      return
    }

    const newHabit: Habit = {
      id: Date.now(),
      name: trimmedName,
      description: newDescription.trim(),
      completedDates: [],
    }

    setHabits((previous) => [...previous, newHabit])
    setNewName('')
    setNewDescription('')
    setNewNameError('')
    setShowForm(false)
  }

  function startEdit(habit: Habit) {
    setEditId(habit.id)
    setEditName(habit.name)
    setEditDescription(habit.description)
    setEditNameError('')
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = editName.trim()

    if (!trimmedName) {
      setEditNameError('Habit name cannot be empty.')
      return
    }

    if (editId === null) return

    setHabits((previous) =>
      previous.map((habit) =>
        habit.id === editId
          ? {
              ...habit,
              name: trimmedName,
              description: editDescription.trim(),
            }
          : habit,
      ),
    )

    setEditId(null)
    setEditName('')
    setEditDescription('')
    setEditNameError('')
  }

  function deleteHabit(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this habit?',
    )

    if (confirmed) {
      setHabits((previous) => previous.filter((habit) => habit.id !== id))
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const weekDates = getWeekDates(weekOffset)
  const selectedDateHabits = habits.filter((habit) =>
    habit.completedDates.includes(selectedDate),
  )

  const weekStart = getDisplayDate(weekDates[0])
  const weekEnd = getDisplayDate(weekDates[6])

  return (
    <div className="app">
      <Navbar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
      />

      <main className="main-container">
        {activePage === 'dashboard' && (
          <section className="habits-section" id="dashboard">
            <div className="section-heading">
              <div>
                <p className="date-label">{today}</p>
                <h1>Today's Habits</h1>
                <p className="section-description">
                  Small steps, consistent progress.
                </p>
              </div>

              <button
                className="add-habit-btn"
                onClick={() => {
                  setShowForm((previous) => !previous)
                  setNewNameError('')
                }}
              >
                + Add Habit
              </button>
            </div>

            {showForm && (
              <form className="habit-form" onSubmit={addHabit}>
                <h2>Add a new habit</h2>

                <input
                  type="text"
                  placeholder="Enter habit name"
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value)
                    setNewNameError('')
                  }}
                  required
                />

                {newNameError && (
                  <p className="form-error">{newNameError}</p>
                )}

                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                />

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Save Habit
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false)
                      setNewName('')
                      setNewDescription('')
                      setNewNameError('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="habit-list">
              {habits.length > 0 ? (
                habits.map((habit) => (
                  <div key={habit.id}>
                    {editId === habit.id ? (
                      <form className="edit-form" onSubmit={saveEdit}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => {
                            setEditName(event.target.value)
                            setEditNameError('')
                          }}
                          placeholder="Habit name"
                          required
                        />

                        {editNameError && (
                          <p className="form-error">{editNameError}</p>
                        )}

                        <input
                          type="text"
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          placeholder="Description (optional)"
                        />

                        <div className="form-actions">
                          <button type="submit" className="save-btn">
                            Save Changes
                          </button>

                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                              setEditId(null)
                              setEditName('')
                              setEditDescription('')
                              setEditNameError('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <HabitItem
                        habit={habit}
                        onToggle={toggleHabit}
                        onEdit={startEdit}
                        onDelete={deleteHabit}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No habits added yet.</p>
                  <span>Add your first habit to get started!</span>
                </div>
              )}
            </div>
          </section>
        )}

        {activePage === 'analytics' && (
          <section className="analytics-section" id="analytics">
            <div className="page-heading">
              <p className="date-label">{today}</p>
              <h1>Analytics & Progress</h1>
              <p className="section-description">
                Track your consistency and review your habit history.
              </p>
            </div>

            <section className="analytics-card">
              <h2>Habit Streaks</h2>
              <p className="analytics-description">
                Your current and longest consistency for each habit.
              </p>

              {habits.length > 0 ? (
                <div className="streak-list">
                  {habits.map((habit) => (
                    <article className="streak-item" key={habit.id}>
                      <div>
                        <h3>{habit.name}</h3>
                        <p>
                          🔥 Current: {calculateCurrentStreak(habit.completedDates)} days
                        </p>
                      </div>

                      <div className="best-streak">
                        <span>Best streak</span>
                        <strong>
                          {calculateLongestStreak(habit.completedDates)} days
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="analytics-empty">
                  Add habits to start tracking your streaks.
                </p>
              )}
            </section>

            <section className="analytics-card">
              <div className="calendar-heading">
                <div>
                  <h2>Weekly Habit Calendar</h2>
                  <p className="analytics-description">
                    {weekStart} – {weekEnd}
                  </p>
                </div>

                <div className="calendar-navigation">
                  <button
                    onClick={() => {
                      const newOffset = weekOffset - 1
                      const dates = getWeekDates(newOffset)
                      setWeekOffset(newOffset)
                      setSelectedDate(dates[0])
                    }}
                    aria-label="Previous week"
                  >
                    ←
                  </button>

                  <button
                    onClick={() => {
                      const newOffset = weekOffset + 1
                      const dates = getWeekDates(newOffset)
                      setWeekOffset(newOffset)
                      setSelectedDate(dates[0])
                    }}
                    disabled={weekOffset >= 0}
                    aria-label="Next week"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="weekly-calendar">
                {weekDates.map((date) => {
                  const dateObject = new Date(`${date}T00:00:00`)
                  const completedCount = habits.filter((habit) =>
                    habit.completedDates.includes(date),
                  ).length
                  const isSelected = selectedDate === date
                  const isToday = date === getTodayDate()

                  return (
                    <button
                      key={date}
                      className={`calendar-day ${isSelected ? 'selected' : ''} ${
                        isToday ? 'today' : ''
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="calendar-day-name">
                        {dateObject.toLocaleDateString('en-IN', {
                          weekday: 'short',
                        })}
                      </span>

                      <strong>{dateObject.getDate()}</strong>

                      <span className="calendar-day-count">
                        {completedCount}/{habits.length}
                      </span>

                      {completedCount > 0 && (
                        <span className="calendar-day-dot" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="calendar-legend">
                <span>
                  <i className="legend-dot completed-dot" />
                  Completed habits
                </span>
                <span>
                  <i className="legend-dot" />
                  No completion
                </span>
              </div>
            </section>

            <section className="analytics-card">
              <h2>Completion History</h2>
              <p className="analytics-description">
                Habits completed on {getDisplayDate(selectedDate)}.
              </p>

              <div className="history-summary">
                <strong>
                  {selectedDateHabits.length} / {habits.length}
                </strong>
                <span>habits completed</span>
              </div>

              {habits.length > 0 ? (
                <div className="history-list">
                  {habits.map((habit) => {
                    const completed = habit.completedDates.includes(selectedDate)

                    return (
                      <div className="history-item" key={habit.id}>
                        <span className={completed ? 'history-check done' : 'history-check'}>
                          {completed ? '✓' : '○'}
                        </span>
                        <span>{habit.name}</span>
                        <span className="history-status">
                          {completed ? 'Completed' : 'Incomplete'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="analytics-empty">No habits to show yet.</p>
              )}
            </section>
          </section>
        )}

        {activePage === 'settings' && (
          <section className="settings-section" id="settings">
            <div className="page-heading">
              <p className="date-label">MyHabits preferences</p>
              <h1>Settings</h1>
              <p className="section-description">
                Manage your app preferences in one place.
              </p>
            </div>

            <div className="analytics-card settings-placeholder">
              <h2>App Settings</h2>
              <p>
                Theme and other preferences will be available in Day 4.
              </p>
            </div>
          </section>
        )}

        <footer className="footer">
          MyHabits © 2026
        </footer>
      </main>
    </div>
  )
}

export default App
