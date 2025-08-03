'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Edit,
  Type,
  Image,
  Video,
  Divide,
  MousePointer,
  Grip,
  Settings,
  Layout,
  Palette,
  Grid3X3,
  Move,
  Copy
} from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import DraggableContentBlock from './DraggableContentBlock'
import DroppableCanvas from './DroppableCanvas'
import ContentBlockToolbar from './ContentBlockToolbar'

interface PageData {
  id: string
  title: string
  description: string
  blocks: ContentBlockData[]
  layout: 'single-column' | 'two-column' | 'three-column' | 'grid'
  createdAt: string
  updatedAt: string
}

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

interface PageBuilderProps {
  pageData: PageData
  onUpdatePageData: (updates: Partial<PageData>) => void
  onAddContentBlock: (type: ContentBlockData['type']) => void
  isPreviewMode: boolean
}

export default function PageBuilder({
  pageData,
  onUpdatePageData,
  onAddContentBlock,
  isPreviewMode
}: PageBuilderProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showBlockEditor, setShowBlockEditor] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [canvasMode, setCanvasMode] = useState<'freeform' | 'grid'>('freeform')
  const [showGrid, setShowGrid] = useState(true)
  const [draggedBlock, setDraggedBlock] = useState<ContentBlockData | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Handle block selection
  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
    setShowBlockEditor(true)
  }, [])

  // Handle block deletion
  const handleBlockDelete = useCallback((blockId: string) => {
    const updatedBlocks = pageData.blocks.filter(block => block.id !== blockId)
    onUpdatePageData({ blocks: updatedBlocks })
    setSelectedBlockId(null)
    setShowBlockEditor(false)
  }, [pageData.blocks, onUpdatePageData])

  // Handle block update
  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlockData>) => {
    const updatedBlocks = pageData.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    onUpdatePageData({ blocks: updatedBlocks })
  }, [pageData.blocks, onUpdatePageData])

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    const block = pageData.blocks.find(b => b.id === active.id)
    if (block) {
      setDraggedBlock(block)
    }
  }, [pageData.blocks])

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event

    setActiveId(null)
    setDraggedBlock(null)

    if (!over) return

    const activeBlock = pageData.blocks.find(b => b.id === active.id)
    if (!activeBlock) return

    // If dropped on canvas, update position
    if (over.id === 'canvas') {
      const updatedBlocks = pageData.blocks.map(block => {
        if (block.id === active.id) {
          return {
            ...block,
            position: {
              ...block.position,
              x: Math.max(0, block.position.x + delta.x),
              y: Math.max(0, block.position.y + delta.y),
            }
          }
        }
        return block
      })
      onUpdatePageData({ blocks: updatedBlocks })
    }
  }, [pageData.blocks, onUpdatePageData])

  // Handle block position update (for direct positioning)
  const handleBlockPositionUpdate = useCallback((blockId: string, x: number, y: number) => {
    const updatedBlocks = pageData.blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          position: {
            ...block.position,
            x: Math.max(0, x),
            y: Math.max(0, y),
          }
        }
      }
      return block
    })
    onUpdatePageData({ blocks: updatedBlocks })
  }, [pageData.blocks, onUpdatePageData])

  // Handle block resize
  const handleBlockResize = useCallback((blockId: string, width: number, height: number) => {
    const updatedBlocks = pageData.blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          position: {
            ...block.position,
            width: Math.max(100, width),
            height: Math.max(50, height),
          }
        }
      }
      return block
    })
    onUpdatePageData({ blocks: updatedBlocks })
  }, [pageData.blocks, onUpdatePageData])

  // Duplicate block
  const handleBlockDuplicate = useCallback((blockId: string) => {
    const blockToDuplicate = pageData.blocks.find(b => b.id === blockId)
    if (!blockToDuplicate) return

    const newBlock: ContentBlockData = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      position: {
        ...blockToDuplicate.position,
        x: blockToDuplicate.position.x + 20,
        y: blockToDuplicate.position.y + 20,
      }
    }

    onUpdatePageData({ blocks: [...pageData.blocks, newBlock] })
  }, [pageData.blocks, onUpdatePageData])

  // Get selected block
  const selectedBlock = selectedBlockId ? 
    pageData.blocks.find(block => block.id === selectedBlockId) : null

  // Enhanced content types with more options
  const contentTypes = [
    { type: 'heading' as const, icon: Type, label: 'Heading', description: 'Add a title or heading', category: 'text' },
    { type: 'text' as const, icon: Type, label: 'Text', description: 'Add paragraph text', category: 'text' },
    { type: 'image' as const, icon: Image, label: 'Image', description: 'Add an image', category: 'media' },
    { type: 'video' as const, icon: Video, label: 'Video', description: 'Embed a video', category: 'media' },
    { type: 'button' as const, icon: MousePointer, label: 'Button', description: 'Add a clickable button', category: 'interactive' },
    { type: 'divider' as const, icon: Divide, label: 'Divider', description: 'Add a separator line', category: 'layout' }
  ]

  // Enhanced add content block with positioning
  const handleAddContentBlock = useCallback((type: ContentBlockData['type']) => {
    const canvasRect = document.getElementById('page-canvas')?.getBoundingClientRect()
    const defaultX = canvasRect ? Math.max(50, Math.random() * (canvasRect.width - 300)) : 50
    const defaultY = canvasRect ? Math.max(50, Math.random() * (canvasRect.height - 200)) : 50

    onAddContentBlock(type)

    // Update the newly added block with proper positioning
    setTimeout(() => {
      const newBlock = pageData.blocks[pageData.blocks.length - 1]
      if (newBlock) {
        handleBlockUpdate(newBlock.id, {
          position: {
            x: defaultX,
            y: defaultY,
            width: getDefaultWidth(type),
            height: getDefaultHeight(type),
          }
        })
      }
    }, 0)
  }, [onAddContentBlock, pageData.blocks, handleBlockUpdate])

  // Get default dimensions for content types
  const getDefaultWidth = (type: ContentBlockData['type']) => {
    switch (type) {
      case 'heading': return 400
      case 'text': return 350
      case 'image': return 300
      case 'video': return 400
      case 'button': return 150
      case 'divider': return 300
      default: return 300
    }
  }

  const getDefaultHeight = (type: ContentBlockData['type']) => {
    switch (type) {
      case 'heading': return 60
      case 'text': return 100
      case 'image': return 200
      case 'video': return 225
      case 'button': return 50
      case 'divider': return 20
      default: return 100
    }
  }

  if (isPreviewMode) {
    return (
      <div className="w-full">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">Preview Mode</h3>
          <p className="text-sm text-blue-700">This is how your page will look to viewers.</p>
        </div>

        <div
          className="bg-white border rounded-lg relative min-h-[600px] overflow-hidden"
          style={{
            backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto'
          }}
        >
          {pageData.blocks.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Layout className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No content blocks added yet</p>
                <p className="text-sm">Add content blocks to start building your page</p>
              </div>
            </div>
          ) : (
            <>
              {pageData.blocks.map(block => (
                <div
                  key={block.id}
                  className="absolute"
                  style={{
                    left: block.position.x,
                    top: block.position.y,
                    width: block.position.width,
                    height: block.position.height,
                    zIndex: block.zIndex || 1,
                  }}
                >
                  <DraggableContentBlock
                    block={block}
                    isSelected={false}
                    isPreviewMode={true}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onDuplicate={() => {}}
                    onPositionUpdate={() => {}}
                    onResize={() => {}}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Google Sites Builder</TabsTrigger>
            <TabsTrigger value="settings">Page Settings</TabsTrigger>
            <TabsTrigger value="data">JSON Data</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            {/* Canvas Controls */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="canvas-mode" className="text-sm font-medium">Canvas Mode:</Label>
                    <Select value={canvasMode} onValueChange={(value: 'freeform' | 'grid') => setCanvasMode(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freeform">Freeform</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                    className={showGrid ? 'bg-blue-50 border-blue-200' : ''}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    {showGrid ? 'Hide Grid' : 'Show Grid'}
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {pageData.blocks.length} content block{pageData.blocks.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600 text-sm">
                    <strong>💡 Quick Tips:</strong> Click blocks to select • Drag to move • Right-click for options • Delete/Backspace to remove • Ctrl+D to duplicate
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Content Blocks Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Insert
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contentTypes.map(({ type, icon: Icon, label, description, category }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="w-full justify-start h-auto p-3 hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => handleAddContentBlock(type)}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 mt-0.5 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Block Properties Panel */}
                {selectedBlock && showBlockEditor && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ContentBlockToolbar
                        block={selectedBlock}
                        onUpdate={(updates) => handleBlockUpdate(selectedBlock.id, updates)}
                        onClose={() => setShowBlockEditor(false)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Canvas */}
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Layout className="h-5 w-5 mr-2" />
                        Canvas
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedBlockId && (
                          <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                            Block selected
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Drag content blocks anywhere on the canvas. Click to select and edit properties.
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DroppableCanvas
                      id="page-canvas"
                      className={`relative min-h-[600px] border-2 border-dashed border-gray-200 ${
                        showGrid ? 'bg-grid' : 'bg-white'
                      }`}
                      style={{
                        backgroundImage: showGrid
                          ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
                          : 'none',
                        backgroundSize: showGrid ? '20px 20px' : 'auto'
                      }}
                    >
                      {pageData.blocks.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Plus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Start building your page</p>
                            <p className="text-sm">Drag content blocks from the left panel</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {pageData.blocks.map(block => (
                            <div
                              key={block.id}
                              className="absolute"
                              style={{
                                left: block.position.x,
                                top: block.position.y,
                                width: block.position.width,
                                height: block.position.height,
                                zIndex: block.zIndex || 1,
                              }}
                            >
                              <DraggableContentBlock
                                block={block}
                                isSelected={selectedBlockId === block.id}
                                isPreviewMode={false}
                                onSelect={handleBlockSelect}
                                onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                                onDelete={() => handleBlockDelete(block.id)}
                                onDuplicate={() => handleBlockDuplicate(block.id)}
                                onPositionUpdate={(x, y) => handleBlockPositionUpdate(block.id, x, y)}
                                onResize={(width, height) => handleBlockResize(block.id, width, height)}
                              />
                            </div>
                          ))}
                        </>
                      )}
                    </DroppableCanvas>
                  </CardContent>
                </Card>
              </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={pageData.title}
                  onChange={(e) => onUpdatePageData({ title: e.target.value })}
                  placeholder="Enter page title"
                />
              </div>
              
              <div>
                <Label htmlFor="page-description">Page Description</Label>
                <Textarea
                  id="page-description"
                  value={pageData.description}
                  onChange={(e) => onUpdatePageData({ description: e.target.value })}
                  placeholder="Enter page description"
                />
              </div>

              <div>
                <Label htmlFor="page-layout">Page Layout</Label>
                <Select
                  value={pageData.layout}
                  onValueChange={(value) => onUpdatePageData({ layout: value as PageData['layout'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-column">Single Column</SelectItem>
                    <SelectItem value="two-column">Two Column</SelectItem>
                    <SelectItem value="three-column">Three Column</SelectItem>
                    <SelectItem value="grid">Grid Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and edit the raw JSON data for this page. This is what gets saved to localStorage.
              </p>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(pageData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedBlock ? (
          <div className="opacity-80 transform rotate-3 shadow-2xl">
            <DraggableContentBlock
              block={draggedBlock}
              isSelected={false}
              isPreviewMode={false}
              onSelect={() => {}}
              onUpdate={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
              onPositionUpdate={() => {}}
              onResize={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </div>
  </DndContext>
  )
}

// Block Editor Component
interface BlockEditorProps {
  block: ContentBlockData
  onUpdate: (updates: Partial<ContentBlockData>) => void
  onClose: () => void
}

function BlockEditor({ block, onUpdate, onClose }: BlockEditorProps) {
  const handleContentUpdate = (field: string, value: any) => {
    onUpdate({
      content: { ...block.content, [field]: value }
    })
  }

  const handleStyleUpdate = (field: string, value: any) => {
    onUpdate({
      styles: { ...block.styles, [field]: value }
    })
  }

  return (
    <div className="space-y-4">
      {/* Content Settings */}
      <div>
        <Label className="text-sm font-medium">Content</Label>
        {block.type === 'text' && (
          <Textarea
            value={block.content.text || ''}
            onChange={(e) => handleContentUpdate('text', e.target.value)}
            placeholder="Enter text content"
            className="mt-1"
          />
        )}
        {block.type === 'heading' && (
          <div className="space-y-2 mt-1">
            <Input
              value={block.content.text || ''}
              onChange={(e) => handleContentUpdate('text', e.target.value)}
              placeholder="Enter heading text"
            />
            <Select
              value={block.content.level?.toString() || '2'}
              onValueChange={(value) => handleContentUpdate('level', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {block.type === 'image' && (
          <div className="space-y-2 mt-1">
            <Input
              value={block.content.src || ''}
              onChange={(e) => handleContentUpdate('src', e.target.value)}
              placeholder="Image URL"
            />
            <Input
              value={block.content.alt || ''}
              onChange={(e) => handleContentUpdate('alt', e.target.value)}
              placeholder="Alt text"
            />
          </div>
        )}
        {block.type === 'video' && (
          <div className="space-y-2 mt-1">
            <Input
              value={block.content.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
              placeholder="Video URL (YouTube, Vimeo, etc.)"
            />
            <Input
              value={block.content.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              placeholder="Video title"
            />
          </div>
        )}
        {block.type === 'button' && (
          <div className="space-y-2 mt-1">
            <Input
              value={block.content.text || ''}
              onChange={(e) => handleContentUpdate('text', e.target.value)}
              placeholder="Button text"
            />
            <Input
              value={block.content.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
              placeholder="Button URL"
            />
          </div>
        )}
      </div>

      {/* Style Settings */}
      <div>
        <Label className="text-sm font-medium">Styling</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Label className="text-xs">Text Align</Label>
            <Select
              value={block.styles.textAlign || 'left'}
              onValueChange={(value) => handleStyleUpdate('textAlign', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              value={block.styles.fontSize || ''}
              onChange={(e) => handleStyleUpdate('fontSize', e.target.value)}
              placeholder="16px"
            />
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClose} className="w-full">
        Close Editor
      </Button>
    </div>
  )
}