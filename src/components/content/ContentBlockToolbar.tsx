'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'

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
  content: Record<string, unknown>
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

interface ContentBlockToolbarProps {
  block: ContentBlockData
  onUpdate: (updates: Partial<ContentBlockData>) => void
  onClose: () => void
}

export default function ContentBlockToolbar({
  block,
  onUpdate,
  onClose
}: ContentBlockToolbarProps) {

  const updateContent = (contentUpdates: Record<string, unknown>) => {
    onUpdate({
      content: { ...block.content, ...contentUpdates }
    })
  }

  const updateStyles = (styleUpdates: Record<string, unknown>) => {
    onUpdate({
      styles: { ...block.styles, ...styleUpdates }
    })
  }

  const updatePosition = (positionUpdates: Record<string, unknown>) => {
    onUpdate({
      position: { ...block.position, ...positionUpdates }
    })
  }

  const renderContentEditor = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="heading-text">Heading Text</Label>
              <Input
                id="heading-text"
                value={block.content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="Enter heading text"
              />
            </div>
            <div>
              <Label htmlFor="heading-level">Heading Level</Label>
              <Select
                value={block.content.level?.toString() || '2'}
                onValueChange={(value) => updateContent({ level: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 - Largest</SelectItem>
                  <SelectItem value="2">H2 - Large</SelectItem>
                  <SelectItem value="3">H3 - Medium</SelectItem>
                  <SelectItem value="4">H4 - Small</SelectItem>
                  <SelectItem value="5">H5 - Smaller</SelectItem>
                  <SelectItem value="6">H6 - Smallest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'text':
        return (
          <div>
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={block.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={block.content.src || ''}
                onChange={(e) => updateContent({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={block.content.alt || ''}
                onChange={(e) => updateContent({ alt: e.target.value })}
                placeholder="Describe the image"
              />
            </div>
            <div>
              <Label htmlFor="image-caption">Caption (optional)</Label>
              <Input
                id="image-caption"
                value={block.content.caption || ''}
                onChange={(e) => updateContent({ caption: e.target.value })}
                placeholder="Image caption"
              />
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="video-url">YouTube URL</Label>
              <Input
                id="video-url"
                value={block.content.url || ''}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Video title"
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={block.content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="Click Me"
              />
            </div>
            <div>
              <Label htmlFor="button-url">Link URL</Label>
              <Input
                id="button-url"
                value={block.content.url || ''}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="button-style">Button Style</Label>
              <Select
                value={block.content.style || 'primary'}
                onValueChange={(value) => updateContent({ style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'divider':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="divider-style">Line Style</Label>
              <Select
                value={block.content.style || 'solid'}
                onValueChange={(value) => updateContent({ style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="divider-color">Line Color</Label>
              <Input
                id="divider-color"
                type="color"
                value={block.content.color || '#e2e8f0'}
                onChange={(e) => updateContent({ color: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return <p className="text-gray-500">No content options available for this block type.</p>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{block.type} Block</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="position">Position</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {renderContentEditor()}
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bg-color">Background</Label>
              <Input
                id="bg-color"
                type="color"
                value={block.styles.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <Input
                id="text-color"
                type="color"
                value={block.styles.textColor || '#000000'}
                onChange={(e) => updateStyles({ textColor: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={block.styles.fontSize || '16px'}
              onValueChange={(value) => updateStyles({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">12px - Small</SelectItem>
                <SelectItem value="14px">14px - Default</SelectItem>
                <SelectItem value="16px">16px - Medium</SelectItem>
                <SelectItem value="18px">18px - Large</SelectItem>
                <SelectItem value="24px">24px - Extra Large</SelectItem>
                <SelectItem value="32px">32px - Huge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="text-align">Text Alignment</Label>
            <Select
              value={block.styles.textAlign || 'left'}
              onValueChange={(value) => updateStyles({ textAlign: value })}
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
            <Label htmlFor="border-radius">Border Radius</Label>
            <Select
              value={block.styles.borderRadius || '0px'}
              onValueChange={(value) => updateStyles({ borderRadius: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">None</SelectItem>
                <SelectItem value="4px">Small</SelectItem>
                <SelectItem value="8px">Medium</SelectItem>
                <SelectItem value="12px">Large</SelectItem>
                <SelectItem value="50%">Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="position" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pos-x">X Position</Label>
              <Input
                id="pos-x"
                type="number"
                value={block.position.x}
                onChange={(e) => updatePosition({ x: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="pos-y">Y Position</Label>
              <Input
                id="pos-y"
                type="number"
                value={block.position.y}
                onChange={(e) => updatePosition({ y: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={block.position.width}
                onChange={(e) => updatePosition({ width: parseInt(e.target.value) || 100 })}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={block.position.height}
                onChange={(e) => updatePosition({ height: parseInt(e.target.value) || 50 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="z-index">Layer (Z-Index)</Label>
            <Input
              id="z-index"
              type="number"
              value={block.zIndex || 1}
              onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) || 1 })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
