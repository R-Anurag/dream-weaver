
"use client";

import React, { useState } from 'react';
import type { Board, CanvasItem, ItemType } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';

interface CanvasProps {
  boardItems: CanvasItem[];
  onUpdateItem: (item: CanvasItem) => void;
  onAddItem: (item: CanvasItem) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  activeTool: 'select' | 'pencil' | 'eraser';
}

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function Canvas({ 
  boardItems,
  onUpdateItem, 
  onAddItem,
  selectedItemId, 
  onSelectItem, 
  onEditItem, 
  onDeleteItem,
  activeTool
}: CanvasProps) {

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<CanvasItem | null>(null);

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - canvas.left,
      y: clientY - canvas.top
    };
  };

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      if (activeTool === 'select' && !('touches' in e)) { // Don't deselect on touch drag start on canvas background
          onSelectItem(null);
      }
      return;
    }
    if (activeTool !== 'pencil') return;

    setIsDrawing(true);
    const { x, y } = getPointerPosition(e);
    
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

    const { x, y } = getPointerPosition(e);
    
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
    if (!isDrawing || !currentDrawing) return;
    setIsDrawing(false);
    if (currentDrawing.style.points && currentDrawing.style.points.length > 1) {
      onAddItem(currentDrawing);
    }
    setCurrentDrawing(null);
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

  return (
    <div
      id="canvas"
      className="flex-1 w-full h-full bg-background relative overflow-auto touch-none"
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
          onSelect={onSelectItem}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}
