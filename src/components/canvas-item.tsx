
"use client";

import React, { useRef, useEffect } from 'react';
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
  const itemRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({
    type: null as 'move' | 'resize' | null,
    startX: 0,
    startY: 0,
    startItemX: 0,
    startItemY: 0,
    startWidth: 0,
    startHeight: 0,
    handle: null as string | null,
    isInteracting: false,
  });

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, type: 'move' | 'resize', handle?: string) => {
    // Prevent interaction on right-click
    if ('button' in e && e.button === 2) return;

    // Stop the event from propagating to parent elements (like the canvas)
    e.stopPropagation();
    
    // Prevent default touch behavior like scrolling
    if ('touches' in e) {
      e.preventDefault();
    }
    
    // Select the item if it's not already selected
    if (!isSelected) {
      onSelect(item.id);
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    interactionRef.current = {
      type: type,
      startX: clientX,
      startY: clientY,
      startItemX: item.x,
      startItemY: item.y,
      startWidth: item.width,
      startHeight: item.height,
      handle,
      isInteracting: false,
    };

    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
  };

  const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
    // Prevent scroll on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }
      
    const { type, startX, startY, startWidth, startHeight, handle, startItemX, startItemY } = interactionRef.current;
    if (!type) return;

    interactionRef.current.isInteracting = true;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

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
    }
  };

  const handleInteractionEnd = () => {
    window.removeEventListener('mousemove', handleInteractionMove);
    window.removeEventListener('mouseup', handleInteractionEnd);
    window.removeEventListener('touchmove', handleInteractionMove);
    window.removeEventListener('touchend', handleInteractionEnd);
    
    // Use a timeout to reset the interaction state,
    // which prevents the click event from firing immediately after a drag.
    setTimeout(() => {
        if (interactionRef.current) {
            interactionRef.current.isInteracting = false;
            interactionRef.current.type = null;
        }
    }, 0);
  };
  
  useEffect(() => {
    // Cleanup event listeners when the component unmounts
    return () => {
        handleInteractionEnd();
    }
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item.id);
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }
  
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If an interaction (drag/resize) just finished, don't process the click.
    if (interactionRef.current.isInteracting) return;
    
    // If the click is on a control button, let that button's onClick handle it.
    if ((e.target as HTMLElement).closest('[data-control]')) {
        return;
    }
    
    // Otherwise, select the item.
    onSelect(item.id);
  };

  const handleItemMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start a drag if clicking on a textarea.
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
      onSelect(item.id);
      return;
    }
    // Start move interaction only if not clicking a resize handle or a control button
    if (!(e.target as HTMLElement).closest('[data-resize-handle]') && !(e.target as HTMLElement).closest('[data-control]')) {
        onSelect(item.id)
    }
  }

  const handleItemTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
      onSelect(item.id);
      e.stopPropagation();
      return;
    }
    if (!(e.target as HTMLElement).closest('[data-resize-handle]') && !(e.target as HTMLElement).closest('[data-control]')) {
        onSelect(item.id)
    }
  }

  const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div
      ref={itemRef}
      className={cn("absolute", isSelected ? "cursor-default" : "cursor-pointer")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        touchAction: 'none', // Prevents default browser touch actions like scrolling
      }}
      onClick={handleItemClick}
      onMouseDown={handleItemMouseDown}
      onTouchStart={handleItemTouchStart}
    >
        <div className={cn("w-full h-full transition-shadow duration-200 group", isSelected && "shadow-2xl ring-2 ring-accent ring-offset-2 rounded-lg")}>
          {item.type === 'image' && (
            <Image src={item.content} layout="fill" objectFit="cover" alt="User upload" className="rounded-md" data-ai-hint="dream board" />
          )}
          {item.type === 'text' && (
             <textarea
                value={item.content}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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

          {isSelected && (
            <>
              {resizeHandles.map(handle => (
                <div
                  key={handle}
                  data-resize-handle
                  className={cn(
                    'absolute w-3 h-3 bg-accent border-2 border-white rounded-full',
                    handle.includes('top') && '-top-1.5',
                    handle.includes('bottom') && '-bottom-1.5',
                    handle.includes('left') && '-left-1.5',
                    handle.includes('right') && '-right-1.5',
                    (handle.includes('left') && handle.includes('top')) || (handle.includes('right') && handle.includes('bottom')) ? 'cursor-nwse-resize' : 'cursor-nesw-resize'
                  )}
                  onMouseDown={(e) => handleInteractionStart(e, 'resize', handle)}
                  onTouchStart={(e) => handleInteractionStart(e, 'resize', handle)}
                />
              ))}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-2">
                <div
                    data-control
                    className="p-1 bg-accent border-2 border-white rounded-full cursor-move"
                    onMouseDown={(e) => handleInteractionStart(e, 'move')}
                    onTouchStart={(e) => handleInteractionStart(e, 'move')}
                >
                  <Move className="w-4 h-4 text-accent-foreground" />
                </div>
                <div
                    data-control
                    className="p-1 bg-accent border-2 border-white rounded-full cursor-pointer"
                    onClick={handleEditClick}
                >
                  <Settings className="w-4 h-4 text-accent-foreground" />
                </div>
                <div
                    data-control
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

    