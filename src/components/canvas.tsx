"use client";

import React from 'react';
import type { Board, CanvasItem } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';

interface CanvasProps {
  board: Board | undefined;
  onUpdateItem: (item: CanvasItem) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export default function Canvas({ board, onUpdateItem, selectedItemId, onSelectItem }: CanvasProps) {
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelectItem(null);
    }
  };
  
  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-muted-foreground">Select a board to start dreaming or create a new one!</p>
      </div>
    );
  }

  return (
    <div
      id="canvas"
      className="flex-1 w-full h-full bg-background relative overflow-auto"
      onClick={handleCanvasClick}
      style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
      }}
    >
      {board.items.map(item => (
        <CanvasItemComponent
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          isSelected={item.id === selectedItemId}
          onSelect={onSelectItem}
        />
      ))}
    </div>
  );
}
