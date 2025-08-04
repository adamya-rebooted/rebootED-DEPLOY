'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Trash2, Edit, Layers } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onBringToFront: () => void
  onSendToBack: () => void
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems = [
    { icon: Edit, label: 'Edit Properties', action: onEdit, shortcut: 'Enter' },
    { icon: Copy, label: 'Duplicate', action: onDuplicate, shortcut: 'Ctrl+D' },
    { icon: Layers, label: 'Bring to Front', action: onBringToFront },
    { icon: Layers, label: 'Send to Back', action: onSendToBack },
    { icon: Trash2, label: 'Delete', action: onDelete, shortcut: 'Del', danger: true },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{ left: x, top: y }}
    >
      <Card className="shadow-lg border-gray-200 min-w-48">
        <CardContent className="p-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start h-8 px-2 text-sm ${
                item.danger ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''
              }`}
              onClick={() => {
                item.action()
                onClose()
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-400 ml-2">{item.shortcut}</span>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
