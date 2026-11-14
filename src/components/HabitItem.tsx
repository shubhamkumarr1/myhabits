
import type { Habit } from '../types/Habit'

type HabitItemProps = {
  habit: Habit
  onToggle: (id: number) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: number) => void
}

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function HabitItem({
  habit,
  onToggle,
  onEdit,
  onDelete,
}: HabitItemProps) {
  const completedToday = habit.completedDates.includes(getTodayDate())

  return (
    <article className={`habit-item ${completedToday ? 'is-completed' : ''}`}>
      <button
        className="habit-checkbox"
        onClick={() => onToggle(habit.id)}
        aria-label={completedToday ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={completedToday}
      >
        {completedToday && <span>✓</span>}
      </button>

      <div className="habit-details">
        <h3>{habit.name}</h3>
        {habit.description && <p>{habit.description}</p>}
      </div>

      <div className="habit-actions">
        <button className="edit-btn" onClick={() => onEdit(habit)}>
          Edit
        </button>

        <button className="delete-btn" onClick={() => onDelete(habit.id)}>
          Delete
        </button>
      </div>
    </article>
  )
}

export default HabitItem
