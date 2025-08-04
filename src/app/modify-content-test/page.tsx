'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/content/DashboardLayout'
import PageBuilder from '@/components/content/PageBuilder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye, Layout } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PageData {
  id: string
  title: string
  description: string
  blocks: ContentBlock[]
  layout: 'single-column' | 'two-column' | 'three-column' | 'grid'
  createdAt: string
  updatedAt: string
}

interface ContentBlock {
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

export default function ModifyContentTestPage() {
  const router = useRouter()
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pages, setPages] = useState<PageData[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  // Load pages from localStorage on component mount
  useEffect(() => {
    const savedPages = localStorage.getItem('page-builder-pages')
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages)
        setPages(parsedPages)
        if (parsedPages.length > 0) {
          setSelectedPageId(parsedPages[0].id)
          setPageData(parsedPages[0])
        }
      } catch (error) {
        console.error('Error loading pages from localStorage:', error)
        // Create a default page if loading fails
        createNewPage()
      }
    } else {
      // Create a default page if none exist
      createNewPage()
    }
  }, [])

  const createNewPage = () => {
    const sampleBlocks: ContentBlock[] = [
      {
        id: 'sample-heading',
        type: 'heading',
        position: { x: 50, y: 50, width: 500, height: 80, row: 0, col: 0 },
        content: { text: 'Welcome to Your Page Builder', level: 1 },
        styles: {
          textAlign: 'center',
          fontSize: '32px',
          textColor: '#1f3a60',
          backgroundColor: 'transparent',
          padding: '20px',
          borderRadius: '8px'
        },
        zIndex: 1
      },
      {
        id: 'sample-text',
        type: 'text',
        position: { x: 50, y: 150, width: 400, height: 120, row: 1, col: 0 },
        content: { text: 'This is a powerful drag-and-drop page builder similar to Google Sites. You can drag content blocks anywhere on the canvas, resize them, and customize their properties.' },
        styles: {
          textAlign: 'left',
          fontSize: '16px',
          textColor: '#374151',
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        },
        zIndex: 1
      },
      {
        id: 'sample-button',
        type: 'button',
        position: { x: 500, y: 200, width: 180, height: 50, row: 2, col: 0 },
        content: { text: 'Get Started', url: '#', style: 'primary' },
        styles: {
          textAlign: 'center',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: '6px',
          padding: '12px 24px'
        },
        zIndex: 1
      }
    ]

    const newPage: PageData = {
      id: `page-${Date.now()}`,
      title: 'Google Sites-Like Page Builder Demo',
      description: 'A demonstration of the drag-and-drop page builder with sample content',
      blocks: sampleBlocks,
      layout: 'single-column',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setPageData(newPage)
    setPages([newPage])
    setSelectedPageId(newPage.id)
  }

  // Save page data to localStorage
  const savePage = async () => {
    if (!pageData) return

    setIsSaving(true)
    try {
      const updatedPage = {
        ...pageData,
        updatedAt: new Date().toISOString()
      }
      
      const updatedPages = pages.map(page => 
        page.id === updatedPage.id ? updatedPage : page
      )
      
      localStorage.setItem('page-builder-pages', JSON.stringify(updatedPages))
      setPages(updatedPages)
      setPageData(updatedPage)
      
      toast.success('Page saved successfully!')
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error('Failed to save page')
    } finally {
      setIsSaving(false)
    }
  }

  // Update page data
  const updatePageData = (updates: Partial<PageData>) => {
    if (!pageData) return
    setPageData({ ...pageData, ...updates })
  }

  // Add a new content block
  const addContentBlock = (type: ContentBlock['type']) => {
    if (!pageData) return

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      position: {
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 200,
        width: getDefaultWidth(type),
        height: getDefaultHeight(type),
        row: pageData.blocks.length,
        col: 0
      },
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      zIndex: 1
    }

    updatePageData({
      blocks: [...pageData.blocks, newBlock]
    })
  }

  // Get default dimensions for content types
  const getDefaultWidth = (type: ContentBlock['type']) => {
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

  const getDefaultHeight = (type: ContentBlock['type']) => {
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

  // Get default content for block type
  const getDefaultContent = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here...' }
      case 'heading':
        return { text: 'Heading Text', level: 2 }
      case 'image':
        return { src: '', alt: 'Image description', caption: '' }
      case 'video':
        return { url: '', title: 'Video Title' }
      case 'button':
        return { text: 'Click Me', url: '#', style: 'primary' }
      case 'divider':
        return { style: 'solid', color: '#e2e8f0' }
      default:
        return {}
    }
  }

  // Get default styles for block type
  const getDefaultStyles = (type: ContentBlock['type']) => {
    const baseStyles = {
      padding: '16px',
      margin: '8px',
      borderRadius: '8px'
    }

    switch (type) {
      case 'heading':
        return { ...baseStyles, fontSize: '24px', textAlign: 'left' as const }
      case 'text':
        return { ...baseStyles, fontSize: '16px', textAlign: 'left' as const }
      case 'button':
        return { ...baseStyles, textAlign: 'center' as const, backgroundColor: '#3b82f6', textColor: '#ffffff' }
      default:
        return baseStyles
    }
  }

  if (!pageData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Layout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Page Builder...</h3>
            <p className="text-muted-foreground">Setting up your page building environment</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{pageData.title}</h1>
                <p className="text-sm text-muted-foreground">Page Builder Test Environment</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                size="sm"
                onClick={savePage}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Page'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="h-6 w-6 mr-2 text-blue-600" />
                Google Sites-Style Page Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                A complete drag-and-drop page builder with freeform positioning, just like Google Sites.
                Drag content blocks anywhere on the canvas, resize them, and customize their properties.
                <br />
                <strong>Features:</strong> Drag & drop • Resize handles • Right-click context menu • Keyboard shortcuts • Grid snapping
              </p>
            </CardHeader>
            <CardContent>
              <PageBuilder
                pageData={pageData}
                onUpdatePageData={updatePageData}
                onAddContentBlock={addContentBlock}
                isPreviewMode={isPreviewMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}