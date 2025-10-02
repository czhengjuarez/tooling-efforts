import { useState, useRef } from 'react'
import { DndContext, pointerWithin, DragOverlay } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import QuadrantGrid from './QuadrantGrid'
import AIToolsSectionV2 from './AIToolsSectionV2'
import StickyNote from './StickyNote'

const AuditBoard = () => {
  const [notes, setNotes] = useState([])
  const [nextId, setNextId] = useState(1)
  const [activeId, setActiveId] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [apiKey, setApiKey] = useState(null)

  const addNote = (quadrant, content = '') => {
    const newNote = {
      id: nextId,
      content: content,
      quadrant: quadrant,
      x: Math.random() * 200,
      y: Math.random() * 200
    }
    setNotes([...notes, newNote])
    setNextId(nextId + 1)
  }

  const handleGenerateTools = (tools, provider, key) => {
    const newNotes = tools.map(tool => ({
      id: `ai-${Date.now()}-${Math.random()}`,
      content: tool.name,
      quadrant: tool.quadrant,
      x: Math.random() * 200,
      y: Math.random() * 200,
      impact: tool.impact,
      effort: tool.effort,
      reasoning: tool.reasoning,
      description: tool.description
    }))
    
    setNotes(prevNotes => [...prevNotes, ...newNotes])
    setSelectedProvider(provider)
    setApiKey(key)
  }

  const clearAIGeneratedNotes = () => {
    // Remove all notes that have AI-generated IDs (start with 'ai-')
    setNotes(prevNotes => prevNotes.filter(note => !note.id.toString().startsWith('ai-')))
  }

  const clearAllNotes = () => {
    // Clear ALL notes (both AI-generated and manual)
    if (notes.length === 0) return
    
    const confirmed = window.confirm(`Are you sure you want to delete ALL ${notes.length} sticky notes? This cannot be undone.`)
    if (confirmed) {
      setNotes([])
    }
  }


  const updateNote = (id, content) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content } : note
    ))
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over, delta } = event
    setActiveId(null)
    
    console.log('Drag end:', { active: active?.id, over: over?.id, delta })
    
    const activeNote = notes.find(note => note.id === active.id)
    if (!activeNote) return


    const newX = Math.max(0, activeNote.x + delta.x)
    const newY = Math.max(0, activeNote.y + delta.y)
    let newQuadrant = activeNote.quadrant
    
    // Check if dropped on a quadrant
    if (over && ['q1', 'q2', 'q3', 'q4'].includes(over.id)) {
      newQuadrant = over.id
    }
    
    console.log('Updating note:', {
      id: activeNote.id,
      newQuadrant,
      newX: newQuadrant !== activeNote.quadrant ? Math.random() * 200 : Math.max(0, Math.min(250, newX)),
      newY: newQuadrant !== activeNote.quadrant ? Math.random() * 200 : Math.max(0, Math.min(180, newY))
    })
    
    setNotes(prevNotes => 
      prevNotes.map(note =>
        note.id === activeNote.id 
          ? { 
              ...note, 
              quadrant: newQuadrant,
              x: newQuadrant !== activeNote.quadrant ? Math.random() * 200 : Math.max(0, Math.min(250, newX)),
              y: newQuadrant !== activeNote.quadrant ? Math.random() * 200 : Math.max(0, Math.min(180, newY))
            }
          : note
      )
    )
  }

  const activeNote = activeId ? notes.find(note => note.id === activeId) : null

  return (
    <DndContext 
      collisionDetection={pointerWithin} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-6xl mx-auto">
        <AIToolsSectionV2 
          onGenerateTools={handleGenerateTools} 
          onClearAINotes={clearAIGeneratedNotes}
          onClearAllNotes={clearAllNotes}
        />
        <SortableContext items={notes.map(note => note.id)} strategy={rectSortingStrategy}>
          <QuadrantGrid 
            notes={notes}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        </SortableContext>
      </div>
      
      <DragOverlay>
        {activeNote ? (
          <div className="bg-yellow-200 border border-yellow-400 rounded-lg p-2 shadow-lg w-24 h-20 opacity-90 rotate-3 transform scale-105">
            <div className="text-xs leading-tight w-full h-full overflow-hidden">
              {activeNote.content || 'Click to edit...'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default AuditBoard
