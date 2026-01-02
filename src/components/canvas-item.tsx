
"use client";

import React, { useRef, useCallback, useEffect } from 'react';
import type { CanvasItem } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Move, Settings, Trash2 } from 'lucide-react';
import { Alegreya, Architects_Daughter, Caveat } from 'next/font/google';

const alegreya = Alegreya({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-alegreya',
});

const architectsDaughter = Architects_Daughter({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-architects-daughter',
});

const caveat = Caveat({
    subsets: ['latin'],
    variable: '--font-caveat',
});

const fontMapping: { [key: string]: { className: string } } = {
  Alegreya: alegreya,
  'Architects Daughter': architectsDaughter,
  Caveat: caveat,
};


interface CanvasItemProps {
  item: CanvasItem;
  onUpdate: (item: CanvasItem) => void;
  isSelected: boolean;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onStopEditing: () => void;
  onItemPointerDown: (id: string, e: React.PointerEvent<HTMLDivElement>) => void;
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

export default function CanvasItemComponent({ 
    item, 
    onUpdate, 
    isSelected, 
    isEditing,
    onEdit, 
    onDelete,
    onDoubleClick,
    onStopEditing,
    onItemPointerDown
}: CanvasItemProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
    }
  }, [isEditing]);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item.id);
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...item, content: e.target.value });
  };
  
  const fontClass = fontMapping[item.style.fontFamily]?.className || alegreya.className;

  const itemContent = () => {
    if (isEditing && (item.type === 'text' || item.type === 'post-it')) {
        return (
             <textarea
                ref={textareaRef}
                value={item.content}
                onChange={handleTextChange}
                onBlur={onStopEditing}
                className={cn(
                    "absolute inset-0 w-full h-full bg-transparent resize-none outline-none overflow-hidden",
                    item.type === 'text' ? 'p-2' : 'p-4',
                    fontClass
                )}
                style={{
                    color: item.style.color,
                    fontSize: item.style.fontSize,
                    textAlign: item.style.textAlign,
                    lineHeight: 1.2
                }}
            />
        )
    }

    switch(item.type) {
        case 'image':
            return <Image src={item.content} layout="fill" objectFit="cover" alt="User upload" className="rounded-md pointer-events-none" data-ai-hint="dream board" />;
        case 'text':
             return (
                 <div
                    className={cn("w-full h-full p-2 bg-transparent overflow-hidden pointer-events-none", fontClass)}
                    style={{
                      color: item.style.color,
                      fontSize: item.style.fontSize,
                      textAlign: item.style.textAlign,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                 >
                  {item.content}
                 </div>
             );
        case 'post-it':
             return (
                 <div
                    className={cn("w-full h-full p-4 rounded-sm shadow-md overflow-hidden pointer-events-none", fontClass)}
                    style={{
                      backgroundColor: item.style.backgroundColor,
                      color: item.style.color,
                      fontSize: item.style.fontSize,
                      textAlign: item.style.textAlign,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}
                 >
                    {item.content}
                 </div>
             );
        case 'shape':
            return (
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="overflow-visible pointer-events-none">
                    <Shape item={item} />
                </svg>
            );
        default:
            return null;
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onItemPointerDown(item.id, e);
  };


  return (
    <div
      className={cn("absolute cursor-move")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
      }}
      onDoubleClick={() => onDoubleClick(item.id)}
      onPointerDown={handlePointerDown}
    >
        <div 
          className={cn("w-full h-full transition-shadow duration-200 group", 
            isSelected && "shadow-2xl ring-2 ring-accent ring-offset-2 ring-offset-background",
            item.type === 'post-it' ? 'rounded-sm' : 'rounded-lg'
          )}
        >
            {item.type === 'post-it' ? 
                <div className="w-full h-full shadow-md" style={{ backgroundColor: item.style.backgroundColor }} />
                : null
            }
            {itemContent()}
        </div>

          {isSelected && !isEditing && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 bg-background p-1 rounded-full shadow-lg border" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
              <div
                  className="p-1.5 rounded-full cursor-grab active:cursor-grabbing hover:bg-muted"
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
