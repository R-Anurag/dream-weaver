
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, useTransition } from 'react';
import { Search, Eye, ThumbsDown, ArrowLeft, Plus, Brush, Sparkles, Star, Mic, Loader2 } from 'lucide-react';
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
import { searchBoards } from '@/ai/flows/search-flow';


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
  const [allBoards] = useState<Board[]>(() => sampleBoards.filter(b => b.published));
  const [filteredBoardIds, setFilteredBoardIds] = useState<string[]>(() => allBoards.map(b => b.id));
  const [isSearching, startSearchTransition] = useTransition();

  const router = useRouter();
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: isMobile ? 'y' : 'x',
    skipSnaps: false,
    loop: true,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setSearchTerm(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech') {
        toast({ title: 'Speech Recognition Error', description: `An error occurred: ${event.error}`, variant: 'destructive' });
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [toast]);
  
  const handleSearch = useCallback((query: string) => {
    if (!query) {
      setFilteredBoardIds(allBoards.map(b => b.id));
      return;
    }
    startSearchTransition(async () => {
      try {
        const result = await searchBoards(query, allBoards);
        if (result && result.rankedBoardIds) {
          setFilteredBoardIds(result.rankedBoardIds);
        }
      } catch (error) {
        console.error("AI search failed", error);
        toast({ title: 'Search Error', description: 'The AI search failed. Please try again.', variant: 'destructive' });
        // Fallback to simple search
        const lowercasedFilter = query.toLowerCase();
        const fallbackIds = allBoards.filter(board =>
            board.name.toLowerCase().includes(lowercasedFilter) ||
            (board.description && board.description.toLowerCase().includes(lowercasedFilter)) ||
            board.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter))
        ).map(b => b.id);
        setFilteredBoardIds(fallbackIds);
      }
    });
  }, [allBoards, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500); // Debounce search
    return () => clearTimeout(handler);
  }, [searchTerm, handleSearch]);

  const filteredBoards = useMemo(() => {
    const boardMap = new Map(allBoards.map(b => [b.id, b]));
    return filteredBoardIds.map(id => boardMap.get(id)).filter((b): b is Board => !!b);
  }, [filteredBoardIds, allBoards]);
  
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
    const recognition = recognitionRef.current;
    if (!recognition) {
        toast({
            title: "Browser Not Supported",
            description: "Your browser doesn't support speech recognition.",
            variant: "destructive"
        });
        return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        setSearchTerm('');
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Could not start recognition', error);
        toast({ title: 'Could Not Start', description: 'Please check microphone permissions.', variant: 'destructive' });
      }
    }
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
        }
        setCurrentIndex(0);
    }
  }, [filteredBoardIds, emblaApi, isMobile]);
  
  if (isMobile) {
    return (
      <div className="min-h-svh w-screen bg-black relative overflow-hidden">
        <header className="p-4 absolute top-0 left-0 right-0 z-30">
            <div className="flex items-center gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                    {isSearching ? 
                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80 animate-spin" /> :
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80 pointer-events-none" />
                    }
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 pr-10 h-11 bg-black/50 text-white border-white/30 backdrop-blur-sm placeholder:text-white/60"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleMicSearch}>
                        <Mic className={cn("h-5 w-5 text-white/80 hover:text-white", isListening && "text-destructive animate-pulse")} />
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
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Brush className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline">Dream Weaver</span>
          </Link>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                 {isSearching ? 
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" /> :
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                }
                <Input
                placeholder="Search projects..."
                className="pl-10 pr-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleMicSearch}>
                    <Mic className={cn("h-5 w-5 text-muted-foreground hover:text-foreground", isListening && "text-destructive animate-pulse")} />
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
          {isSearching ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h3 className="mt-4 text-xl font-semibold">Searching...</h3>
              <p className="text-muted-foreground">Our AI is finding the best matches for you.</p>
            </div>
          ) : filteredBoards.length > 0 && currentBoard ? (
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
