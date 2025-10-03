import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from './Icon'

const StickyNote = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(note.content)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: note.id,
    data: {
      type: 'note',
      note: note
    },
    disabled: isEditing
  })

  // Check if this is an AI-generated note with impact/effort data
  const isAIGenerated = note.id.toString().startsWith('ai-')
  const hasMetrics = note.impact !== undefined && note.effort !== undefined

  return (
    <div
      ref={setNodeRef}
      className="absolute bg-yellow-200 border border-yellow-400 p-2 shadow-md select-none w-24 h-20"
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
      }}
      {...attributes}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(note.id)
        }}
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center leading-none"
        title="Delete note"
      >
        ×
      </button>

      {/* AI-generated badges and research link */}
      {isAIGenerated && hasMetrics && (
        <div className="absolute top-1 right-1 flex gap-1">
          <span 
            className="bg-primary-500 text-white text-[8px] px-1 rounded-sm font-bold flex items-center gap-0.5 cursor-help"
            title={`Impact: ${Number(note.impact).toFixed(1)}/10 - Business value (higher = more valuable)`}
          >
            <Icon name="lightbulb" className="w-2 h-2" />
            {Number(note.impact).toFixed(1)}
          </span>
          <span 
            className="bg-purple-500 text-white text-[8px] px-1 rounded-sm font-bold flex items-center gap-0.5 cursor-help"
            title={`Effort: ${Number(note.effort).toFixed(1)}/10 - Implementation complexity (higher = more work)`}
          >
            <Icon name="lightning" className="w-2 h-2" />
            {Number(note.effort).toFixed(1)}
          </span>
        </div>
      )}

      {/* Research link for AI-generated tools */}
      {isAIGenerated && (
        <div className="absolute bottom-1 right-1">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(note.content.split('\n')[0] + ' tool review 2024')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-[8px] px-1.5 py-0.5 rounded-sm font-medium transition-colors flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            title="Research this tool"
          >
            <Icon name="search" className="w-2 h-2" />
            Research
          </a>
        </div>
      )}

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent border-none outline-none resize-none text-xs leading-tight"
          onBlur={() => {
            onUpdate(note.id, content)
            setIsEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onUpdate(note.id, content)
              setIsEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          autoFocus
          placeholder="Enter your idea..."
        />
      ) : (
        <div 
          className="w-full h-full cursor-text text-xs leading-tight overflow-hidden"
          onMouseDown={(e) => {
            // Check if it's a quick click (not a drag)
            const startTime = Date.now()
            const startX = e.clientX
            const startY = e.clientY
            
            const handleMouseUp = (upEvent) => {
              const endTime = Date.now()
              const endX = upEvent.clientX
              const endY = upEvent.clientY
              const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
              
              // If it was a quick click with minimal movement, treat as edit
              if (endTime - startTime < 200 && distance < 5) {
                console.log('Quick click detected - entering edit mode')
                setIsEditing(true)
              }
              
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mouseup', handleMouseUp)
          }}
          {...listeners}
        >
          {note.content || 'Click to edit...'}
        </div>
      )}
    </div>
  )
}

export default StickyNote
