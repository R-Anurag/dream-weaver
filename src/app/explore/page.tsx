
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, ThumbsDown, ArrowLeft, Plus, Brush, Sparkles, Star, Mic } from 'lucide-react';
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
import { ProposalDialog } from '@/components/proposal-dialog';
import { useToast } from '@/hooks/use-toast';


const VisionBoardCard = ({ board, onDoubleClick }: { board: Board, onDoubleClick?: () => void }) => {

  return (
    <div 
        className={cn("relative w-full h-full overflow-hidden rounded-2xl shadow-2xl group")}
        onDoubleClick={onDoubleClick}
    >
      <Image
        src={board.thumbnailUrl || `/images/urbanfarming.jpg`}
        alt={board.name}
        width={800}
        height={600}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="vision board"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute top-4 left-4 flex gap-2">
         {board.flairs?.map(flair => (
              <Badge key={flair} variant="secondary" className="backdrop-blur-sm bg-black/40 text-white border-none text-sm">
                <Star className="h-4 w-4 mr-2 text-yellow-400" /> {flair}
              </Badge>
            ))}
      </div>
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
        </div>
      </div>
    </div>
  );
};

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBoards, setAllBoards] = useState<Board[]>(sampleBoards);
  const router = useRouter();
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: isMobile ? 'y' : 'x',
    skipSnaps: false,
    loop: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  
  const publishedBoards = useMemo(() => allBoards.filter(b => b.published), [allBoards]);

  const filteredBoards = useMemo(() => {
    if (!searchTerm) {
      return publishedBoards;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return publishedBoards.filter(board =>
        board.name.toLowerCase().includes(lowercasedFilter) ||
        (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
        board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm, publishedBoards]);
  
  const currentBoard = useMemo(() => filteredBoards[currentIndex], [filteredBoards, currentIndex]);
  
  const handleOpenBoard = useCallback((boardId: string) => {
    router.push(`/boards/view/${boardId}`);
  }, [router]);

  const handleNextBoard = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const handlePrevBoard = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, []);
  
  const handleMicSearch = () => {
    toast({
        title: "Coming Soon!",
        description: "Voice search will be available in a future update."
    });
  };

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      if(emblaApi) emblaApi.off('select', onSelect);
    }
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
        emblaApi.reInit();
        if (filteredBoards.length > 0) {
            emblaApi.scrollTo(0, true);
            setCurrentIndex(0);
        }
    }
  }, [searchTerm, filteredBoards.length, emblaApi, isMobile]);
  
  if (isMobile) {
    return (
      <div className="min-h-svh w-screen bg-black relative overflow-hidden">
        <header className="p-4 absolute top-0 left-0 right-0 z-30">
            <div className="flex items-center gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80 pointer-events-none" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 pr-10 h-11 bg-black/50 text-white border-white/30 backdrop-blur-sm placeholder:text-white/60"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleMicSearch}>
                        <Mic className="h-5 w-5 text-white/80 hover:text-white" />
                    </button>
                </div>
                <div className="flex items-center gap-1">
                 <Button asChild size="icon" className="h-11 w-11 flex-shrink-0 bg-black/50 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
                    <Link href="/boards">
                        <Brush className="h-5 w-5" />
                    </Link>
                </Button>
                </div>
            </div>
        </header>
        <div className="w-full h-svh">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full flex-col">
                    {filteredBoards.map((board) => (
                        <div key={board.id} className="relative flex-[0_0_100%] w-full h-full min-h-0">
                           <VisionBoardCard board={board} onDoubleClick={() => handleOpenBoard(board.id)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background overflow-hidden">
      <header className="p-4 md:p-6 border-b bg-background/95 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/boards" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Brush className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline">Dream Weaver</span>
          </Link>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                placeholder="Search projects..."
                className="pl-10 pr-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleMicSearch}>
                    <Mic className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/boards">
                  <Plus className="mr-2 h-4 w-4" /> Create Board
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        <div className="w-full flex items-center justify-center gap-8 h-full max-h-[75vh]">
          {filteredBoards.length > 0 && currentBoard ? (
            <>
               <Button onClick={handlePrevBoard} variant="outline" size="lg" className="shadow-lg hover:bg-muted flex-shrink-0 w-40">
                  <ThumbsDown className="h-5 w-5 mr-2 text-destructive" />
                  Pass
              </Button>
              
              <div className="w-full h-full cursor-pointer max-w-4xl aspect-[4/3]">
                 <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {filteredBoards.map((board) => (
                            <div key={board.id} className="relative flex-[0_0_100%] w-full h-full min-h-0" >
                               <VisionBoardCard board={board} onDoubleClick={() => handleOpenBoard(board.id)}/>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                 <Button size="lg" className="shadow-lg flex-shrink-0 w-40" onClick={() => handleOpenBoard(currentBoard.id)}>
                    <Eye className="h-5 w-5 mr-2" />
                    View
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
