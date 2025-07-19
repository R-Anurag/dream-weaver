
"use client";

import React, { useState, useEffect } from 'react';
import type { Board, CanvasItem, Proposal } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';
import { sampleBoards } from '@/lib/sample-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ProposalDialog } from '@/components/proposal-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
      className="flex-1 w-full h-full bg-background relative overflow-auto rounded-lg border shadow-inner"
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
              onEdit={() => {}}
              onDelete={() => {}}
            />
        </div>
      ))}
    </div>
  );
}


export default function ViewBoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const [board, setBoard] = useState<Board | undefined>();
  const [hasSentProposal, setHasSentProposal] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!boardId) return;

    // Check sample boards
    const sampleBoard = sampleBoards.find(b => b.id === boardId);
    if (sampleBoard) {
      setBoard(sampleBoard);
    } else {
      // If not in sample, check local storage
      try {
        const savedBoards = localStorage.getItem('dreamWeaverBoards');
        if (savedBoards) {
          const localBoards: Board[] = JSON.parse(savedBoards);
          const userBoard = localBoards.find(b => b.id === boardId);
          if (userBoard) {
            setBoard(userBoard);
          }
        }
      } catch (error) {
        console.error("Failed to load board from localStorage", error);
      }
    }

    // Check if a proposal has been sent for this board
    try {
        const key = `proposals_${boardId}`;
        const existingProposalsRaw = localStorage.getItem(key);
        if (existingProposalsRaw) {
            const proposals: Proposal[] = JSON.parse(existingProposalsRaw);
            // Simple check if any proposal exists for this board from "Local User"
            if (proposals.some(p => p.userName === 'Local User')) {
                setHasSentProposal(true);
            }
        }
    } catch (error) {
        console.error("Failed to check proposals in localStorage", error);
    }

  }, [boardId]);


  return (
    <div className="flex flex-col h-screen w-screen bg-background">
         <header className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
            <Button asChild variant={isMobile ? "ghost" : "outline"} size={isMobile ? "icon" : "default"}>
                <Link href="/explore">
                    <ArrowLeft className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                    {!isMobile && 'Back to Explore'}
                </Link>
            </Button>
            <div className="flex-1 text-center">
                 <h1 className="text-lg md:text-xl font-bold font-headline truncate" title={board?.name}>{board?.name}</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate" title={board?.description}>{board?.description}</p>
            </div>
            <div className="flex justify-end">
               {board && (
                  hasSentProposal ? (
                    <Button variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Proposal Sent
                    </Button>
                  ) : (
                    <ProposalDialog board={board} />
                  )
               )}
            </div>
        </header>
        <main className="flex-1 flex flex-col relative p-4 md:p-8">
            <ViewOnlyCanvas board={board} />
        </main>
    </div>
  );
}
