
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, ThumbsDown, ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { sampleBoards } from '@/lib/sample-data';
import type { Board } from '@/types';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react'
import { cn } from '@/lib/utils';
import Link from 'next/link';


const VisionBoardCard = ({ board }: { board: Board }) => {
  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-2xl shadow-2xl group")}>
      <Image
        src={board.thumbnailUrl || '/images/placeholder.jpg'}
        alt={board.name}
        width={800}
        height={600}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="vision board"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div>
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold font-headline">{board.name}</h2>
          </div>
          <p className="mt-2 text-sm text-white/90">{board.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {board.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="backdrop-blur-sm bg-white/20 text-white border-none">
                {tag}
              </Badge>
            ))}
          </div>
           <div className="mt-4">
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
  );
};

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBoards, setAllBoards] = useState<Board[]>(sampleBoards);
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'x',
    skipSnaps: false,
    loop: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  const dragStart = useRef({ x: 0, y: 0 });
  const isSwiping = useRef(false);

  const loadDataFromStorage = useCallback(() => {
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
    
    const combinedBoards = [...sampleBoards];
    const sampleBoardIds = new Set(sampleBoards.map(b => b.id));
    publishedBoards.forEach(pBoard => {
      if (!sampleBoardIds.has(pBoard.id)) {
        combinedBoards.push(pBoard);
      }
    });

    setAllBoards(combinedBoards);
  }, []);

  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]);
  
  const filteredBoards = useMemo(() => {
    const relevantBoards = allBoards.filter(b => b.published || sampleBoards.some(sb => sb.id === b.id));
    if (!searchTerm) {
      return relevantBoards;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return relevantBoards.filter(board =>
        board.name.toLowerCase().includes(lowercasedFilter) ||
        (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
        board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm, allBoards]);
  
  const currentBoard = useMemo(() => filteredBoards[currentIndex], [filteredBoards, currentIndex]);

  const handleNextBoard = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleOpenBoard = useCallback((boardId: string) => {
    if (boardId) {
      router.push(`/boards/view/${boardId}`);
    }
  }, [router]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, []);

   useEffect(() => {
    if (!emblaApi || !isMobile || !currentBoard) return;

    const onPointerDown = (e: PointerEvent) => {
      isSwiping.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isSwiping.current) return;

      const dx = e.clientX - dragStart.current.x;

      if (dx < -50) { // Left swipe
        emblaApi.reInit();
        handleOpenBoard(currentBoard.id);
      } else if (dx > 50) { // Right swipe
         // Allow carousel's native scroll to handle it
      }
      
      isSwiping.current = false;
    };

    const containerNode = emblaApi.containerNode();
    containerNode.addEventListener('pointerdown', onPointerDown, { capture: true });
    containerNode.addEventListener('pointerup', onPointerUp, { capture: true });
    emblaApi.on('select', onSelect);

    return () => {
      containerNode.removeEventListener('pointerdown', onPointerDown, { capture: true });
      containerNode.removeEventListener('pointerup', onPointerUp, { capture: true });
      if (emblaApi) {
        emblaApi.off('select', onSelect);
      }
    };
  }, [emblaApi, onSelect, isMobile, currentBoard, handleOpenBoard]);
  
  useEffect(() => {
    if (emblaApi) {
        emblaApi.reInit();
        const newIndex = filteredBoards.length > 0 ? 0 : -1;
        if(newIndex !== -1) setCurrentIndex(newIndex);
    }
}, [searchTerm, filteredBoards.length, emblaApi]);
  
  const CarouselArea = (
      <div className={cn("w-full h-full cursor-pointer", isMobile ? "bg-black" : "max-w-4xl aspect-[4/3]")}>
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {filteredBoards.map((board) => (
                        <div key={board.id} className="relative flex-[0_0_100%] w-full h-full">
                             <VisionBoardCard board={board} />
                        </div>
                    ))}
                    {filteredBoards.length === 0 && (
                        <div className="flex-[0_0_100%] w-full h-full flex items-center justify-center text-foreground">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">No boards found</h3>
                                <p className="text-muted-foreground">Try adjusting your search terms.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
      </div>
  )


  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-black relative overflow-hidden">
        <header className="p-4 absolute top-0 left-0 right-0 z-20">
            <div className="flex items-center gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 h-11 bg-black/50 text-white border-white/30 backdrop-blur-sm placeholder:text-white/60"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button asChild size="icon" className="h-11 w-11 flex-shrink-0 bg-black/50 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
                    <Link href="/boards">
                        <Plus className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </header>
        {CarouselArea}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <header className="p-4 md:p-6 border-b bg-background/95 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects, e.g., sustainability"
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <Button asChild>
            <Link href="/boards">
                <Plus className="mr-2 h-4 w-4" /> Create
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        <div className="w-full flex items-center justify-center gap-8 h-full max-h-[75vh]">
          {filteredBoards.length > 0 && currentBoard ? (
            <>
               <Button onClick={handleNextBoard} variant="outline" size="default" className="shadow-lg hover:bg-muted flex-shrink-0">
                  <ThumbsDown className="h-4 w-4 mr-2 text-destructive" />
                  Pass
              </Button>
              
              {CarouselArea}

              <Button onClick={() => handleOpenBoard(currentBoard.id)} size="default" className="shadow-lg flex-shrink-0">
                  <Eye className="h-4 w-4 mr-2" />
                  Interested
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
