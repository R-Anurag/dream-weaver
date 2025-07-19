
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Sparkles, X, Eye, PlusSquare, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { sampleBoards } from '@/lib/sample-data';
import type { Board, Proposal } from '@/types';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils';
import Link from 'next/link';

const VisionBoardCard = ({ board, hasSentProposal }: { board: Board, hasSentProposal: boolean }) => {
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
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold font-headline">{board.name}</h2>
            {hasSentProposal && (
                <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Proposal Sent
                </Badge>
            )}
          </div>
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
  const [sentProposals, setSentProposals] = useState<Record<string, boolean>>({});
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

    // Check localStorage for sent proposals for all boards
    const proposalsMap: Record<string, boolean> = {};
    combinedBoards.forEach(board => {
        try {
            const key = `proposals_${board.id}`;
            const existingProposalsRaw = localStorage.getItem(key);
            if (existingProposalsRaw) {
                const proposals: Proposal[] = JSON.parse(existingProposalsRaw);
                if (proposals.some(p => p.userName === 'Local User')) {
                    proposalsMap[board.id] = true;
                }
            }
        } catch (e) {}
    });
    setSentProposals(proposalsMap);

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
            <div className="flex items-center gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 h-11 bg-black/50 text-white border-white/30 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Button asChild size="icon" className="h-11 w-11 flex-shrink-0 bg-black/50 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
                    <Link href="/boards">
                        <PlusSquare className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </header>

        <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex flex-col h-full">
                {filteredBoards.map((board) => (
                    <div key={board.id} className="relative flex-shrink-0 w-full h-full" onClick={() => handleTap(board.id)}>
                        <VisionBoardCard board={board} hasSentProposal={sentProposals[board.id]} />
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
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
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
          <Button asChild>
            <Link href="/boards">
                <PlusSquare className="mr-2 h-4 w-4" /> Create
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        <div className="w-full flex items-center justify-center gap-8 h-full max-h-[75vh]">
          {currentBoard ? (
            <>
              <Button onClick={handleNextBoard} variant="outline" size="lg" className="bg-white shadow-lg hover:bg-muted flex-shrink-0">
                  <X className="h-5 w-5 mr-2 text-red-500" />
                  Pass
              </Button>
              
              <div className="w-full h-full max-w-4xl aspect-[4/3]">
                 <VisionBoardCard board={currentBoard} hasSentProposal={sentProposals[currentBoard.id]} />
              </div>

              <Button onClick={() => handleViewBoard(currentBoard.id)} size="lg" className="shadow-lg flex-shrink-0">
                  <Eye className="h-5 w-5 mr-2" />
                  Express Interest
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
