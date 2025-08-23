
"use client";

import React, { useRef, useCallback } from 'react';
import type { CanvasItem } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Move, Settings, Trash2 } from 'lucide-react';

interface CanvasItemProps {
  item: CanvasItem;
  onUpdate: (item: CanvasItem) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
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
  const interactionRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    interactionRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: item.x,
      initialY: item.y,
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [item.x, item.y]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!interactionRef.current) return;
    
    const dx = e.clientX - interactionRef.current.startX;
    const dy = e.clientY - interactionRef.current.startY;

    onUpdate({ ...item, x: interactionRef.current.initialX + dx, y: interactionRef.current.initialY + dy });
  }, [item, onUpdate]);

  const handlePointerUp = useCallback(() => {
    interactionRef.current = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, []);
  
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

  return (
    <div
      className={cn("absolute")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
      }}
      onClick={handleItemClick}
    >
        <div className={cn("w-full h-full transition-shadow duration-200 group", isSelected && "shadow-2xl ring-2 ring-accent ring-offset-2 ring-offset-background rounded-lg")}>
          {item.type === 'image' && (
            <Image src={item.content} layout="fill" objectFit="cover" alt="User upload" className="rounded-md pointer-events-none" data-ai-hint="dream board" />
          )}
          {item.type === 'text' && (
             <div
                className="w-full h-full p-2 bg-transparent overflow-hidden pointer-events-none"
                style={{
                  color: item.style.color,
                  fontFamily: item.style.fontFamily,
                  fontSize: item.style.fontSize,
                  textAlign: item.style.textAlign,
                }}
             >
              {item.content}
             </div>
          )}
          {item.type === 'post-it' && (
             <div
                className="w-full h-full p-4 rounded-sm shadow-md overflow-hidden pointer-events-none"
                style={{
                  backgroundColor: item.style.backgroundColor,
                  color: item.style.color,
                  fontFamily: item.style.fontFamily,
                  fontSize: item.style.fontSize,
                  textAlign: item.style.textAlign,
                  whiteSpace: 'pre-wrap'
                }}
             >
                {item.content}
             </div>
          )}
          {item.type === 'shape' && (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="overflow-visible pointer-events-none">
                <Shape item={item} />
            </svg>
          )}
        </div>
          {isSelected && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 bg-background p-1 rounded-full shadow-lg border" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
              <div
                  className="p-1.5 rounded-full cursor-move hover:bg-muted"
                  onPointerDown={handlePointerDown}
              >
                <Move className="w-4 h-4 text-foreground" />
              </div>
              <div
                  className="p-1.5 rounded-full cursor-pointer hover:bg-muted"
                  onClick={handleEditClick}
              >
                <Settings className="w-4 h-4 text-foreground" />
              </div>
              <div
                  className="p-1.5 rounded-full cursor-pointer text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
          )}
    </div>
  );
}
