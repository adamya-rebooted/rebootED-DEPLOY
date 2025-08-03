'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Grip, 
  Trash2, 
  Edit, 
  ChevronUp, 
  ChevronDown,
  Type,
  Image as ImageIcon,
  Video,
  MousePointer,
  Minus
} from 'lucide-react'

interface ContentBlockData {
  id: string
  type: 'text' | 'image' | 'video' | 'heading' | 'divider' | 'button'
  position: { row: number; col: number; width: number; height: number }
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
  }
}

interface ContentBlockProps {
  block: ContentBlockData
  isSelected: boolean
  isPreviewMode: boolean
  onSelect: (blockId: string) => void
  onUpdate: (updates: Partial<ContentBlockData>) => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
}

export default function ContentBlock({
  block,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onMove
}: ContentBlockProps) {
  
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

  // Render the actual content based on type
  const renderContent = () => {
    const commonStyles = {
      textAlign: block.styles.textAlign || 'left',
      fontSize: block.styles.fontSize || 'inherit',
      color: block.styles.textColor || 'inherit',
      backgroundColor: block.styles.backgroundColor || 'transparent',
      padding: block.styles.padding || '0',
      margin: block.styles.margin || '0',
      borderRadius: block.styles.borderRadius || '0',
      border: block.styles.border || 'none'
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
              className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500"
            >
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No image URL provided</p>
              <p className="text-sm">Add an image URL in the editor</p>
            </div>
          )
        }
        return (
          <div style={commonStyles}>
            <img 
              src={block.content.src} 
              alt={block.content.alt || 'Image'} 
              className="max-w-full h-auto rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden border-2 border-dashed border-red-300 p-8 text-center text-red-500">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load image</p>
              <p className="text-sm">Check the image URL</p>
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
              className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500"
            >
              <Video className="h-8 w-8 mx-auto mb-2" />
              <p>No video URL provided</p>
              <p className="text-sm">Add a video URL in the editor</p>
            </div>
          )
        }

        // Extract YouTube video ID if it's a YouTube URL
        const getYouTubeEmbedUrl = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
          const match = url.match(regExp)
          return match && match[2].length === 11 
            ? `https://www.youtube.com/embed/${match[2]}`
            : url
        }

        return (
          <div style={commonStyles}>
            {block.content.title && (
              <h4 className="font-medium mb-2">{block.content.title}</h4>
            )}
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(block.content.url)}
                className="w-full h-full rounded"
                allowFullScreen
                title={block.content.title || 'Video'}
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <div style={{ textAlign: commonStyles.textAlign as any }}>
            <Button
              style={{
                backgroundColor: commonStyles.backgroundColor !== 'transparent' ? commonStyles.backgroundColor : undefined,
                color: commonStyles.color !== 'inherit' ? commonStyles.color : undefined,
                fontSize: commonStyles.fontSize !== 'inherit' ? commonStyles.fontSize : undefined,
                padding: commonStyles.padding !== '0' ? commonStyles.padding : undefined,
                borderRadius: commonStyles.borderRadius !== '0' ? commonStyles.borderRadius : undefined,
                border: commonStyles.border !== 'none' ? commonStyles.border : undefined
              }}
              onClick={() => {
                if (block.content.url && block.content.url !== '#') {
                  window.open(block.content.url, '_blank')
                }
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
              margin: commonStyles.margin !== '0' ? commonStyles.margin : '16px 0',
              backgroundColor: 'transparent'
            }}
          />
        )

      default:
        return (
          <div style={commonStyles} className="p-4 border border-gray-200 rounded">
            <p className="text-gray-500">Unknown content type: {block.type}</p>
          </div>
        )
    }
  }

  if (isPreviewMode) {
    // In preview mode, just render the content without any controls
    return (
      <div className="w-full">
        {renderContent()}
      </div>
    )
  }

  // In edit mode, show the content with controls
  return (
    <Card 
      className={`w-full transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      }`}
      onClick={() => onSelect(block.id)}
    >
      <CardContent className="p-0 relative group">
        {/* Content Area */}
        <div className="p-4">
          {renderContent()}
        </div>

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-x-0 top-0 bg-gray-900 bg-opacity-90 text-white p-2 transition-opacity duration-200 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Block info */}
            <div className="flex items-center space-x-2">
              {getBlockIcon()}
              <span className="text-sm font-medium capitalize">{block.type}</span>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove('up')
                }}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove('down')
                }}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>

              <div className="w-px h-4 bg-white bg-opacity-30 mx-1" />

              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(block.id)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-red-500 hover:bg-opacity-80"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this block?')) {
                    onDelete()
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20 cursor-grab active:cursor-grabbing"
              >
                <Grip className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
        )}
      </CardContent>
    </Card>
  )
}