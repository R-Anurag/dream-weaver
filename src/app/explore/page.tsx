
"use client";

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const sampleBoards = [
  {
    id: '1',
    title: 'Sustainable Urban Farming',
    description: 'A project to bring community gardens to concrete jungles.',
    tags: ['sustainability', 'community', 'urban-farming'],
    thumbnail: 'https://placehold.co/800x600',
    dataAiHint: 'urban farming',
    flairs: ['Design', 'Funding', 'Engineering'],
  },
  {
    id: '2',
    title: 'AI for Education',
    description: 'Personalized learning paths for all students.',
    tags: ['education', 'ai', 'technology'],
    thumbnail: 'https://placehold.co/800x600',
    dataAiHint: 'education technology',
    flairs: ['Development', 'Research'],
  },
  {
    id: '3',
    title: 'Ocean Cleanup Initiative',
    description: 'Leveraging drones and AI to clean our oceans.',
    tags: ['environment', 'technology', 'conservation'],
    thumbnail: 'https://placehold.co/800x600',
    dataAiHint: 'ocean cleanup',
    flairs: ['Engineering', 'Marketing', 'Logistics'],
  },
    {
    id: '4',
    title: 'Future of Remote Work',
    description: 'Creating tools for a more connected remote workforce.',
    tags: ['future-of-work', 'saas', 'community'],
    thumbnail: 'https://placehold.co/800x600',
    dataAiHint: 'remote work',
    flairs: ['Product', 'Design', 'Marketing'],
  },
];

const VisionBoardCard = ({ board }: { board: (typeof sampleBoards)[0] }) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl group">
      <Image
        src={board.thumbnail}
        alt={board.title}
        width={800}
        height={600}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        data-ai-hint={board.dataAiHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div>
          <h2 className="text-2xl font-bold font-headline">{board.title}</h2>
          <p className="mt-2 text-sm text-white/90">{board.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {board.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="backdrop-blur-sm bg-white/20 text-white border-none">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Seeking collaboration in:</p>
              <div className="flex flex-wrap gap-2">
                {board.flairs.map(flair => (
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

  const filteredBoards = useMemo(() => {
    if (!searchTerm) {
      return sampleBoards;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return sampleBoards.filter(board =>
      board.title.toLowerCase().includes(lowercasedFilter) ||
      board.description.toLowerCase().includes(lowercasedFilter) ||
      board.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm]);

  const handleNextBoard = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredBoards.length);
  };
  
  const handleExpressInterest = (boardId: string) => {
    console.log(`Expressed interest in board: ${boardId}`);
    // Next step: Implement the view and propose functionality
    handleNextBoard();
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
                 <Button onClick={() => handleExpressInterest(currentBoard.id)} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-muted">
                    <Sparkles className="h-8 w-8 text-primary" />
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
