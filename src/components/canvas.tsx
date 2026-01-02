
"use client";

import React, { useState, useRef, useCallback } from 'react';
import type { Board, CanvasItem, ItemType } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';

interface CanvasProps {
  boardItems: CanvasItem[];
  onUpdateItem: (item: CanvasItem, recordHistory?: boolean) => void;
  onAddItem: (item: CanvasItem) => void;
  selectedItemId: string | null;
  editingItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onItemDoubleClick: (id: string) => void;
  onStopEditing: () => void;
  activeTool: 'select' | 'pencil' | 'eraser';
  onBringToFront: (id: string) => void;
}

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function Canvas({ 
  boardItems,
  onUpdateItem, 
  onAddItem,
  selectedItemId, 
  editingItemId,
  onSelectItem, 
  onEditItem, 
  onDeleteItem,
  onItemDoubleClick,
  onStopEditing,
  activeTool,
  onBringToFront
}: CanvasProps) {

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<CanvasItem | null>(null);
  
  const interactionRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    const canvas = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - canvas.left,
      y: clientY - canvas.top
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onSelectItem(null);
        if (editingItemId) {
          onStopEditing();
        }
    }
  }

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (activeTool !== 'pencil') return;

    setIsDrawing(true);
    const { x, y } = getPointerPosition(e as React.MouseEvent);
    
    const newDrawing: CanvasItem = {
      id: generateId(),
      type: 'drawing',
      x: 0, y: 0, width: 0, height: 0, rotation: 0, content: '',
      style: {
        backgroundColor: '', color: '', fontFamily: '', fontSize: 16, textAlign: 'center',
        shape: 'rectangle', borderColor: '', borderWidth: 0,
        strokeColor: '#000000',
        strokeWidth: 4,
        points: [[x, y]]
      }
    };
    setCurrentDrawing(newDrawing);
  };
  
  const handleInteractionMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (activeTool === 'eraser' && ('buttons' in e ? e.buttons === 1 : true)) {
        let target: EventTarget | null;
        if ('touches' in e) {
            const touch = e.touches[0];
            target = document.elementFromPoint(touch.clientX, touch.clientY);
        } else {
            target = e.target;
        }

        const svgPath = target as SVGPathElement;
        if (svgPath.tagName === 'path' && svgPath.dataset.id) {
            onDeleteItem(svgPath.dataset.id);
        }
        return;
    }

    if (!isDrawing || activeTool !== 'pencil' || !currentDrawing) return;
    
    if ('touches' in e) {
        e.preventDefault();
    }

    const { x, y } = getPointerPosition(e as React.MouseEvent);
    
    if (currentDrawing.style.points) {
      const updatedDrawing = {
        ...currentDrawing,
        style: {
          ...currentDrawing.style,
          points: [...currentDrawing.style.points, [x, y]] as [number, number][]
        }
      };
      setCurrentDrawing(updatedDrawing);
    }
  };

  const handleInteractionEnd = () => {
    if (isDrawing && currentDrawing) {
        if (currentDrawing.style.points && currentDrawing.style.points.length > 1) {
          onAddItem(currentDrawing);
        }
        setCurrentDrawing(null);
    }
    setIsDrawing(false);
  };

  const renderDrawing = (item: CanvasItem) => {
    if (item.type !== 'drawing' || !item.style.points || item.style.points.length === 0) return null;
    const pathData = "M " + item.style.points.map(p => `${p[0]} ${p[1]}`).join(" L ");
    return (
      <path
        key={item.id}
        data-id={item.id}
        d={pathData}
        stroke={item.style.strokeColor}
        strokeWidth={item.style.strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={activeTool === 'eraser' ? 'cursor-pointer' : 'pointer-events-none'}
      />
    );
  };

  const drawingItems = boardItems ? boardItems.filter(item => item.type === 'drawing') : [];
  const otherItems = boardItems ? boardItems.filter(item => item.type !== 'drawing') : [];
  
  const handleItemPointerDown = (itemId: string, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const item = boardItems.find(i => i.id === itemId);
    if (!item) return;

    if (editingItemId && itemId !== editingItemId) {
      onStopEditing();
    }
    onSelectItem(itemId);
    onBringToFront(itemId);

    interactionRef.current = {
      itemId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
    };

    document.addEventListener('pointermove', handleItemPointerMove);
    document.addEventListener('pointerup', handleItemPointerUp);
  };

  const handleItemPointerMove = (e: PointerEvent) => {
    if (!interactionRef.current) return;
    const { itemId, startX, startY, initialX, initialY } = interactionRef.current;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const currentItem = boardItems.find(i => i.id === itemId);
    if (currentItem) {
      onUpdateItem({ ...currentItem, x: initialX + dx, y: initialY + dy });
    }
  };

  const handleItemPointerUp = () => {
    if (interactionRef.current) {
        const itemToUpdate = boardItems.find(i => i.id === interactionRef.current?.itemId);
        if (itemToUpdate) {
            onUpdateItem(itemToUpdate, true);
        }
    }

    document.removeEventListener('pointermove', handleItemPointerMove);
    document.removeEventListener('pointerup', handleItemPointerUp);
    interactionRef.current = null;
  };

  return (
    <div
      id="canvas"
      className="flex-1 w-full h-full bg-background relative overflow-auto touch-none"
      onClick={handleCanvasClick}
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionMove}
      onTouchEnd={handleInteractionEnd}
      style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          cursor: activeTool === 'pencil' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'default'
      }}
    >
      <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: activeTool === 'eraser' ? 'auto' : 'none' }}>
        {drawingItems.map(renderDrawing)}
        {isDrawing && currentDrawing && renderDrawing(currentDrawing)}
      </svg>
      
      {otherItems.map(item => (
        <CanvasItemComponent
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          isSelected={item.id === selectedItemId}
          isEditing={item.id === editingItemId}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onDoubleClick={onItemDoubleClick}
          onStopEditing={onStopEditing}
          onItemPointerDown={handleItemPointerDown}
        />
      ))}
    </div>
  );
}
