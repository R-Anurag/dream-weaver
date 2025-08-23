
"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import type { CanvasItem } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Move, Settings, Trash2 } from 'lucide-react';

interface CanvasItemProps {
  item: CanvasItem;
  onUpdate: (item: CanvasItem) => void;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Shape = ({ item }: { item: CanvasItem }) => {
  const { shape, backgroundColor, borderColor, borderWidth } = item.style;
  const style = {
    fill: backgroundColor,
    stroke: borderColor,
    strokeWidth: borderWidth,
  };
  switch (shape) {
    case 'rectangle':
      return <rect x={0} y={0} width="100%" height="100%" {...style} rx="4" />;
    case 'circle':
      return <circle cx="50%" cy="50%" r="50%" {...style} />;
    case 'star':
      return <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" transform={`scale(${item.width / 100}, ${item.height / 100})`} {...style} />;
    default:
      return null;
  }
};

export default function CanvasItemComponent({ item, onUpdate, isSelected, onSelect, onEdit, onDelete }: CanvasItemProps) {
  const interactionRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    interactionRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!interactionRef.current.isDragging) return;
    
    const dx = e.clientX - interactionRef.current.startX;
    const dy = e.clientY - interactionRef.current.startY;

    interactionRef.current.startX = e.clientX;
    interactionRef.current.startY = e.clientY;

    onUpdate({ ...item, x: item.x + dx, y: item.y + dy });
  }, [item, onUpdate]);

  const handlePointerUp = useCallback(() => {
    interactionRef.current.isDragging = false;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);
  
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect(item.id);
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item.id);
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }

  const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div
      className={cn("absolute", isSelected ? "cursor-default" : "cursor-pointer")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
      }}
      onClick={handleItemClick}
    >
        <div className={cn("w-full h-full transition-shadow duration-200 group", isSelected && "shadow-2xl ring-2 ring-accent ring-offset-2 rounded-lg")}>
          {item.type === 'image' && (
            <Image src={item.content} layout="fill" objectFit="cover" alt="User upload" className="rounded-md pointer-events-none" data-ai-hint="dream board" />
          )}
          {item.type === 'text' && (
             <textarea
                value={item.content}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onUpdate({ ...item, content: e.target.value })}
                className="w-full h-full p-2 bg-transparent resize-none focus:outline-none cursor-text"
                style={{
                  color: item.style.color,
                  fontFamily: item.style.fontFamily,
                  fontSize: item.style.fontSize,
                  textAlign: item.style.textAlign,
                }}
             />
          )}
          {item.type === 'post-it' && (
             <textarea
                value={item.content}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onUpdate({ ...item, content: e.target.value })}
                className="w-full h-full p-4 resize-none focus:outline-none rounded-sm shadow-md cursor-text"
                style={{
                  backgroundColor: item.style.backgroundColor,
                  color: item.style.color,
                  fontFamily: item.style.fontFamily,
                  fontSize: item.style.fontSize,
                  textAlign: item.style.textAlign,
                }}
             />
          )}
          {item.type === 'shape' && (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="overflow-visible pointer-events-none">
                <Shape item={item} />
            </svg>
          )}

          {isSelected && (
            <>
              {/* Resize handles can be added here with their own onPointerDown handlers */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-2" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                <div
                    className="p-1 bg-accent border-2 border-white rounded-full cursor-move"
                    onPointerDown={handlePointerDown}
                >
                  <Move className="w-4 h-4 text-accent-foreground" />
                </div>
                <div
                    className="p-1 bg-accent border-2 border-white rounded-full cursor-pointer"
                    onClick={handleEditClick}
                >
                  <Settings className="w-4 h-4 text-accent-foreground" />
                </div>
                <div
                    className="p-1 bg-destructive border-2 border-white rounded-full cursor-pointer"
                    onClick={handleDeleteClick}
                >
                  <Trash2 className="w-4 h-4 text-destructive-foreground" />
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  );
}
    
