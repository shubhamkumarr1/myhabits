
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Navbar from './components/Navbar'
import HabitItem from './components/HabitItem'
import type { Habit } from './types/Habit'
import './App.css'

const STORAGE_KEY = 'myhabits_data'

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newNameError, setNewNameError] = useState('')

  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editNameError, setEditNameError] = useState('')

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

  return (
    <div className="app" id="dashboard">
      <Navbar />

      <main className="main-container">
        <section className="habits-section">
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
                <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 10px' }}>
                  {newNameError}
                </p>
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
                        <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 10px' }}>
                          {editNameError}
                        </p>
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

        <footer className="footer">
          MyHabits © 2026
        </footer>
      </main>
    </div>
  )
}

export default App
