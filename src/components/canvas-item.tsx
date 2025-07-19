
"use client";

import React, { useRef, useEffect } from 'react';
import type { CanvasItem } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CanvasItemProps {
  item: CanvasItem;
  onUpdate: (item: CanvasItem) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
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

export default function CanvasItemComponent({ item, onUpdate, isSelected, onSelect }: CanvasItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({
    type: null as 'move' | 'resize' | 'rotate' | null,
    startX: 0,
    startY: 0,
    startItemX: 0,
    startItemY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
    handle: null as string | null,
    isDragging: false,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'resize' | 'rotate', handle?: string) => {
    // Prevent starting a drag on right-click
    if (e.button === 2) return;
    
    // Allow text selection in textareas
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        onSelect(item.id);
        return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelect(item.id);
    
    interactionRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startItemX: item.x,
      startItemY: item.y,
      startWidth: item.width,
      startHeight: item.height,
      startRotation: item.rotation,
      handle,
      isDragging: false,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { type, startX, startY, startWidth, startHeight, handle, startRotation, startItemX, startItemY } = interactionRef.current;
    if (!type) return;

    interactionRef.current.isDragging = true;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (type === 'move') {
      onUpdate({ ...item, x: startItemX + dx, y: startItemY + dy });
    } else if (type === 'resize' && handle) {
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startItemX;
        let newY = startItemY;

        if (handle.includes('right')) newWidth = startWidth + dx;
        if (handle.includes('left')) {
            newWidth = startWidth - dx;
            newX = startItemX + dx;
        }
        if (handle.includes('bottom')) newHeight = startHeight + dy;
        if (handle.includes('top')) {
            newHeight = startHeight - dy;
            newY = startItemY + dy;
        }
        
        onUpdate({ ...item, width: Math.max(newWidth, 20), height: Math.max(newHeight, 20), x: newX, y: newY });
    } else if (type === 'rotate') {
        const centerX = item.x + item.width / 2;
        const centerY = item.y + item.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        onUpdate({...item, rotation: angle - 90});
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!interactionRef.current.isDragging && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        onSelect(item.id);
    }
    interactionRef.current.type = null;
    interactionRef.current.isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
  
  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
  }, []);

  const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div
      ref={itemRef}
      className={cn("absolute cursor-move", isSelected && "z-10")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
        <div className={cn("w-full h-full transition-shadow duration-200", isSelected && "shadow-2xl ring-2 ring-accent ring-offset-2 rounded-lg")}>
          {item.type === 'image' && (
            <Image src={item.content} layout="fill" objectFit="cover" alt="User upload" className="rounded-md" data-ai-hint="dream board" />
          )}
          {item.type === 'text' && (
             <textarea
                value={item.content}
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
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                <Shape item={item} />
            </svg>
          )}
        </div>
        {isSelected && (
          <>
            {resizeHandles.map(handle => (
              <div
                key={handle}
                className={cn(
                  'absolute w-3 h-3 bg-accent border-2 border-white rounded-full',
                  handle.includes('top') && '-top-1.5',
                  handle.includes('bottom') && '-bottom-1.5',
                  handle.includes('left') && '-left-1.5',
                  handle.includes('right') && '-right-1.5',
                  (handle.includes('left') && handle.includes('top')) || (handle.includes('right') && handle.includes('bottom')) ? 'cursor-nwse-resize' : 'cursor-nesw-resize'
                )}
                onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
              />
            ))}
            <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent border-2 border-white rounded-full cursor-alias"
                onMouseDown={(e) => handleMouseDown(e, 'rotate')}
            />
          </>
        )}
    </div>
  );
}
