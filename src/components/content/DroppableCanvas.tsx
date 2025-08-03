'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableCanvasProps {
  id: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function DroppableCanvas({ 
  id, 
  children, 
  className = '', 
  style = {} 
}: DroppableCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}
      style={style}
    >
      {children}
    </div>
  )
}
