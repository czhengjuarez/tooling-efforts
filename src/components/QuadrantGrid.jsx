import { useDroppable } from '@dnd-kit/core'
import StickyNote from './StickyNote'

const Quadrant = ({ id, title, notes, onAddNote, onUpdateNote, onDeleteNote, bgColor }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`relative h-80 border border-primary-500 p-4 ${bgColor} ${
        isOver ? 'ring-4 ring-secondary-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <button
          onClick={() => onAddNote(id)}
          className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          + Add Note
        </button>
      </div>
      
      <div className="relative h-full">
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </div>
  )
}

const QuadrantGrid = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const quadrants = [
    { id: 'q1', title: 'High Impact, High Effort', bgColor: 'bg-gray-50' },
    { id: 'q2', title: 'High Impact, Low Effort', bgColor: 'bg-gray-50' },
    { id: 'q3', title: 'Low Impact, High Effort', bgColor: 'bg-gray-50' },
    { id: 'q4', title: 'Low Impact, Low Effort', bgColor: 'bg-gray-50' }
  ]

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="grid grid-cols-2 gap-6">
        {quadrants.map(quadrant => (
          <Quadrant
            key={quadrant.id}
            id={quadrant.id}
            title={quadrant.title}
            notes={notes.filter(note => note.quadrant === quadrant.id)}
            onAddNote={onAddNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            bgColor={quadrant.bgColor}
          />
        ))}
      </div>
    </div>
  )
}

export default QuadrantGrid
