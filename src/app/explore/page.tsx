
"use client";

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, X, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { sampleBoards } from '@/lib/sample-data';
import type { Board } from '@/types';
import { useRouter } from 'next/navigation';

const VisionBoardCard = ({ board }: { board: Board }) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl group">
      <Image
        src={board.items.find(item => item.type === 'image')?.content || 'https://placehold.co/800x600'}
        alt={board.name}
        width={800}
        height={600}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="vision board"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div>
          <h2 className="text-2xl font-bold font-headline">{board.name}</h2>
          <p className="mt-2 text-sm text-white/90">{board.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {board.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="backdrop-blur-sm bg-white/20 text-white border-none">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Seeking collaboration in:</p>
              <div className="flex flex-wrap gap-2">
                {board.flairs?.map(flair => (
                    <span key={flair} className="text-xs font-medium bg-accent/80 text-accent-foreground rounded-full px-2 py-0.5">
                    {flair}
                    </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const filteredBoards = useMemo(() => {
    if (!searchTerm) {
      return sampleBoards;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return sampleBoards.filter(board =>
      board.name.toLowerCase().includes(lowercasedFilter) ||
      (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
      board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm]);

  const handleNextBoard = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredBoards.length);
  };
  
  const handleViewBoard = (boardId: string) => {
    router.push(`/boards/view/${boardId}`);
  };

  const currentBoard = filteredBoards[currentIndex];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <header className="p-4 md:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search projects, e.g., sustainability"
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0); // Reset index on new search
            }}
          />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm h-[60vh] md:max-w-md md:h-[70vh] flex flex-col items-center justify-center gap-6">
          {currentBoard ? (
            <>
              <div className="w-full h-full">
                 <VisionBoardCard board={currentBoard} />
              </div>
              <div className="flex items-center justify-center gap-4">
                 <Button onClick={handleNextBoard} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-muted">
                    <X className="h-8 w-8 text-red-500" />
                 </Button>
                 <Button onClick={() => handleViewBoard(currentBoard.id)} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-muted">
                    <Eye className="h-8 w-8 text-primary" />
                 </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold">No boards found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
