
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Sparkles, X, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { sampleBoards } from '@/lib/sample-data';
import type { Board } from '@/types';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils';

const VisionBoardCard = ({ board }: { board: Board }) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl group cursor-pointer">
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
  const [allBoards, setAllBoards] = useState<Board[]>(sampleBoards);
  const router = useRouter();
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: true,
  });
  
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    let publishedBoards: Board[] = [];
    try {
        const savedBoards = localStorage.getItem('dreamWeaverBoards');
        if (savedBoards) {
            const localBoards: Board[] = JSON.parse(savedBoards);
            publishedBoards = localBoards.filter(b => b.published);
        }
    } catch (error) {
        console.error("Failed to load published boards from localStorage", error);
    }
    
    // Combine sample boards and user's published boards, avoiding duplicates
    const combinedBoards = [...sampleBoards];
    const sampleBoardIds = new Set(sampleBoards.map(b => b.id));
    publishedBoards.forEach(pBoard => {
      if (!sampleBoardIds.has(pBoard.id)) {
        combinedBoards.push(pBoard);
      }
    });

    setAllBoards(combinedBoards);
  }, []);

  const filteredBoards = useMemo(() => {
    if (!searchTerm) {
      return allBoards;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allBoards.filter(board =>
      (board.published && (
        board.name.toLowerCase().includes(lowercasedFilter) ||
        (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
        board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
      )) || (!board.published && ( // also allow searching sample boards
        board.name.toLowerCase().includes(lowercasedFilter) ||
        (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
        board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
      ))
    ).filter(b => b.published || sampleBoards.some(sb => sb.id === b.id)); // only show published or sample
  }, [searchTerm, allBoards]);

  const handleNextBoard = useCallback(() => {
    if (isMobile) {
      emblaApi?.scrollNext();
    } else {
      setCurrentIndex(prevIndex => (prevIndex + 1) % filteredBoards.length);
    }
  }, [emblaApi, isMobile, filteredBoards.length]);

  const handleViewBoard = (boardId: string) => {
    router.push(`/boards/view/${boardId}`);
  };

  const handleTap = (boardId: string) => {
    setTapCount(prev => prev + 1);
    setTimeout(() => {
        setTapCount(0);
    }, 300); // 300ms window for double tap

    if (tapCount === 1) {
        handleViewBoard(boardId);
    }
  };


  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    emblaApi?.reInit();
    setCurrentIndex(0);
  }, [searchTerm, emblaApi]);


  const currentBoard = filteredBoards[currentIndex];

  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-black relative overflow-hidden">
        <header className="p-4 absolute top-0 left-0 right-0 z-20">
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search projects..."
                    className="pl-10 h-11 bg-black/50 text-white border-white/30 backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </header>

        <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex flex-col h-full">
                {filteredBoards.map((board) => (
                    <div key={board.id} className="relative flex-shrink-0 w-full h-full" onClick={() => handleTap(board.id)}>
                        <VisionBoardCard board={board} />
                    </div>
                ))}
                {filteredBoards.length === 0 && (
                     <div className="flex-shrink-0 w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">No boards found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <header className="p-4 md:p-6 border-b bg-background/95 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search projects, e.g., sustainability"
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
          />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        <div className="w-full flex items-center justify-center gap-6 h-full">
          {currentBoard ? (
            <>
              <Button onClick={handleNextBoard} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-muted flex-shrink-0">
                  <X className="h-8 w-8 text-red-500" />
              </Button>
              
              <div className="w-full h-full max-w-4xl max-h-[75vh] aspect-[4/3]">
                 <VisionBoardCard board={currentBoard} />
              </div>

              <Button onClick={() => handleViewBoard(currentBoard.id)} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-muted flex-shrink-0">
                  <Eye className="h-8 w-8 text-primary" />
              </Button>
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
