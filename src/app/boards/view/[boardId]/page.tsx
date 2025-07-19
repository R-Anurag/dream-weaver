
"use client";

import React from 'react';
import type { Board, CanvasItem } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';
import { sampleBoards } from '@/lib/sample-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ViewOnlyCanvasProps {
  board: Board | undefined;
}

function ViewOnlyCanvas({ board }: ViewOnlyCanvasProps) {
  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-muted-foreground">Board not found.</p>
      </div>
    );
  }

  return (
    <div
      id="canvas"
      className="flex-1 w-full h-full bg-background relative overflow-auto"
      style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
      }}
    >
      {board.items.map(item => (
        <div key={item.id} style={{ pointerEvents: 'none' }}>
            <CanvasItemComponent
              item={item}
              onUpdate={() => {}}
              isSelected={false}
              onSelect={() => {}}
            />
        </div>
      ))}
    </div>
  );
}


export default function ViewBoardPage({ params }: { params: { boardId: string } }) {
  const { boardId } = params;
  const board = sampleBoards.find(b => b.id === boardId);

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
         <header className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between">
            <Button asChild variant="outline">
                <Link href="/explore">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Explore
                </Link>
            </Button>
            <div className="text-center">
                <h1 className="text-xl font-bold font-headline">{board?.name}</h1>
                <p className="text-sm text-muted-foreground">{board?.description}</p>
            </div>
            <div className="w-36"></div>
        </header>
        <main className="flex-1 flex flex-row relative">
            <ViewOnlyCanvas board={board} />
        </main>
    </div>
  );
}
