'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Grip,
  Trash2,
  Edit,
  Copy,
  Move,
  RotateCcw,
  Type,
  Image as ImageIcon,
  Video,
  MousePointer,
  Minus,
  Settings
} from 'lucide-react'
import ContextMenu from './ContextMenu'

interface ContentBlockData {
  id: string
  type: 'text' | 'image' | 'video' | 'heading' | 'divider' | 'button'
  position: { 
    x: number
    y: number
    width: number
    height: number
    row?: number
    col?: number
  }
  content: any
  styles: {
    backgroundColor?: string
    textColor?: string
    fontSize?: string
    textAlign?: 'left' | 'center' | 'right'
    padding?: string
    margin?: string
    borderRadius?: string
    border?: string
    boxShadow?: string
    opacity?: number
  }
  zIndex?: number
}

interface DraggableContentBlockProps {
  block: ContentBlockData
  isSelected: boolean
  isPreviewMode: boolean
  onSelect: (blockId: string) => void
  onUpdate: (updates: Partial<ContentBlockData>) => void
  onDelete: () => void
  onDuplicate: () => void
  onPositionUpdate: (x: number, y: number) => void
  onResize: (width: number, height: number) => void
}

export default function DraggableContentBlock({
  block,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onPositionUpdate,
  onResize
}: DraggableContentBlockProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const blockRef = useRef<HTMLDivElement>(null)

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
    onSelect(block.id)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onSelect('')
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        onDuplicate()
      }
    }

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelected, onDelete, onSelect, onDuplicate])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get icon for content type
  const getBlockIcon = () => {
    switch (block.type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'heading':
        return <Type className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'button':
        return <MousePointer className="h-4 w-4" />
      case 'divider':
        return <Minus className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  // Render content based on block type
  const renderContent = () => {
    const commonStyles = {
      color: block.styles.textColor || '#000000',
      fontSize: block.styles.fontSize || '16px',
      textAlign: block.styles.textAlign || 'left',
      padding: block.styles.padding || '0',
      margin: block.styles.margin || '0',
      borderRadius: block.styles.borderRadius || '0',
      border: block.styles.border || 'none',
      backgroundColor: block.styles.backgroundColor || 'transparent',
      boxShadow: block.styles.boxShadow || 'none',
      opacity: block.styles.opacity || 1,
    }

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.content.level || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag 
            style={commonStyles}
            className="font-bold"
          >
            {block.content.text || 'Heading Text'}
          </HeadingTag>
        )

      case 'text':
        return (
          <p style={commonStyles}>
            {block.content.text || 'Enter your text here...'}
          </p>
        )

      case 'image':
        if (!block.content.src) {
          return (
            <div 
              style={commonStyles}
              className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center"
            >
              <ImageIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">No image URL</p>
            </div>
          )
        }
        return (
          <div style={commonStyles} className="h-full">
            <img 
              src={block.content.src} 
              alt={block.content.alt || 'Image'} 
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden border-2 border-dashed border-red-300 p-8 text-center text-red-500 h-full flex flex-col items-center justify-center">
              <ImageIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">Failed to load image</p>
            </div>
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2 italic">
                {block.content.caption}
              </p>
            )}
          </div>
        )

      case 'video':
        if (!block.content.url) {
          return (
            <div 
              style={commonStyles}
              className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center"
            >
              <Video className="h-8 w-8 mb-2" />
              <p className="text-sm">No video URL</p>
            </div>
          )
        }
        
        // Extract video ID from YouTube URL
        const getYouTubeId = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
          const match = url.match(regExp)
          return (match && match[2].length === 11) ? match[2] : null
        }

        const videoId = getYouTubeId(block.content.url)
        if (videoId) {
          return (
            <div style={commonStyles} className="h-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={block.content.title || 'Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
              />
            </div>
          )
        }
        
        return (
          <div 
            style={commonStyles}
            className="border-2 border-dashed border-yellow-300 p-8 text-center text-yellow-600 h-full flex flex-col items-center justify-center"
          >
            <Video className="h-8 w-8 mb-2" />
            <p className="text-sm">Invalid video URL</p>
            <p className="text-xs">Please use a YouTube URL</p>
          </div>
        )

      case 'button':
        return (
          <div style={{ ...commonStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Button
              variant={block.content.style === 'secondary' ? 'secondary' : 'default'}
              size="sm"
              className="w-full h-full"
              style={{
                backgroundColor: block.styles.backgroundColor || '#3b82f6',
                color: block.styles.textColor || '#ffffff',
                borderRadius: block.styles.borderRadius || '6px',
              }}
              disabled={isPreviewMode && (!block.content.url || block.content.url === '#')}
            >
              {block.content.text || 'Click Me'}
            </Button>
          </div>
        )

      case 'divider':
        return (
          <hr 
            style={{
              border: 'none',
              borderTop: `2px ${block.content.style || 'solid'} ${block.content.color || '#e2e8f0'}`,
              margin: '0',
              backgroundColor: 'transparent',
              width: '100%',
              height: '2px',
            }}
          />
        )

      default:
        return (
          <div style={commonStyles} className="p-4 border border-gray-200 rounded h-full flex items-center justify-center">
            <p className="text-gray-500">Unknown content type: {block.type}</p>
          </div>
        )
    }
  }

  if (isPreviewMode) {
    // In preview mode, just render the content without any controls
    return (
      <div className="w-full h-full">
        {renderContent()}
      </div>
    )
  }

  // In edit mode, show the content with controls
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative w-full h-full transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg'
          : isHovered
            ? 'ring-1 ring-blue-300 shadow-md'
            : 'hover:ring-1 hover:ring-gray-300'
      } ${dndIsDragging ? 'opacity-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(block.id)
      }}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content Area */}
      <Card className="w-full h-full border-0 shadow-sm">
        <CardContent className="p-2 h-full">
          {renderContent()}
        </CardContent>
      </Card>

      {/* Control Toolbar - Only show when selected */}
      {isSelected && (
        <div className="absolute -top-10 left-0 flex items-center space-x-1 bg-white border border-gray-200 rounded-md shadow-lg px-2 py-1 z-50">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            {getBlockIcon()}
            <span className="capitalize">{block.type}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            {...attributes}
            {...listeners}
          >
            <Grip className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize Handles - Only show when selected */}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize z-40" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize z-40" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize z-40" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize z-40" />
          
          {/* Edge resize handles */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-n-resize z-40" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-s-resize z-40" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-w-resize z-40" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-e-resize z-40" />
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={() => onSelect(block.id)}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onBringToFront={() => onUpdate({ zIndex: (block.zIndex || 1) + 10 })}
          onSendToBack={() => onUpdate({ zIndex: Math.max(1, (block.zIndex || 1) - 10) })}
        />
      )}
    </div>
  )
}
