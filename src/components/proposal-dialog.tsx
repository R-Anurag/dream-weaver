
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Send, Sparkles } from 'lucide-react';
import { generateProposalBody, generateProposalHeadings } from '@/ai/flows/proposal-flow';
import { useToast } from './ui/use-toast';
import type { Board } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface ProposalDialogProps {
  board: Board;
  children: React.ReactNode;
}

type Stage = 'generate-headings' | 'select-heading' | 'edit-body' | 'sent';

export function ProposalDialog({ board, children }: ProposalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('generate-headings');
  
  const [headings, setHeadings] = useState<string[]>([]);
  const [selectedHeading, setSelectedHeading] = useState<string | null>(null);
  const [proposalBody, setProposalBody] = useState('');
  
  const [isGenerating, startGeneration] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      handleGenerateHeadings();
    } else {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStage('generate-headings');
        setHeadings([]);
        setSelectedHeading(null);
        setProposalBody('');
      }, 300);
    }
  }, [isOpen]);

  const handleGenerateHeadings = () => {
    setStage('generate-headings');
    setHeadings([]);
    startGeneration(async () => {
      try {
        const result = await generateProposalHeadings(board);
        if (result && result.headings) {
          setHeadings(result.headings);
          setStage('select-heading');
        }
      } catch (error) {
        console.error('Failed to generate headings', error);
        toast({ title: 'Error', description: 'Could not generate proposal ideas.', variant: 'destructive' });
      }
    });
  };
  
  const handleSelectHeading = (heading: string) => {
      setSelectedHeading(heading);
      setProposalBody('');
      setStage('edit-body');
      startGeneration(async () => {
         try {
            const result = await generateProposalBody(board, heading);
            if (result && result.proposal) {
                setProposalBody(result.proposal);
            }
         } catch (error) {
            console.error('Failed to generate proposal body', error);
            toast({ title: 'Error', description: 'Could not generate proposal body.', variant: 'destructive' });
         }
      });
  }

  const handleSendProposal = () => {
    // Here you would typically send the proposal to a backend or state management
    setStage('sent');
    toast({ title: 'Success!', description: 'Your collaboration proposal has been sent.' });
    setTimeout(() => setIsOpen(false), 2000);
  };
  
  const renderContent = () => {
    switch(stage) {
        case 'generate-headings':
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium">Generating Ideas...</h3>
                    <p className="text-muted-foreground text-sm">Our AI is crafting some catchy proposal starters for your project.</p>
                </div>
            )
        case 'select-heading':
            return (
                 <div>
                    <DialogHeader>
                        <DialogTitle>Choose a Proposal Starter</DialogTitle>
                        <DialogDescription>
                            Select one of these AI-generated headings to build your proposal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-6">
                        {headings.map((heading, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelectHeading(heading)}
                                className="text-left p-3 border rounded-lg hover:bg-accent hover:border-primary transition-all duration-200"
                            >
                                <p className="font-medium">{heading}</p>
                            </button>
                        ))}
                    </div>
                     <DialogFooter>
                        <Button variant="ghost" onClick={handleGenerateHeadings} disabled={isGenerating}>
                             <Sparkles className="mr-2 h-4 w-4" /> Regenerate
                        </Button>
                    </DialogFooter>
                </div>
            )
        case 'edit-body':
            return (
                 <div>
                    <DialogHeader>
                        <DialogTitle>Craft Your Proposal</DialogTitle>
                        <DialogDescription>
                            Review and edit the AI-generated proposal below, then send it to the project owner.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Badge variant="secondary">{selectedHeading}</Badge>
                         {isGenerating ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ) : (
                            <Textarea
                                placeholder="Your proposal message..."
                                value={proposalBody}
                                onChange={(e) => setProposalBody(e.target.value)}
                                rows={8}
                                className="text-base"
                            />
                        )}
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setStage('select-heading')}>Back</Button>
                        <Button onClick={handleSendProposal}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Proposal
                        </Button>
                    </DialogFooter>
                </div>
            )
        case 'sent':
            return (
                 <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <Sparkles className="h-12 w-12 text-accent mb-4 animate-pulse" />
                    <h3 className="text-lg font-medium">Proposal Sent!</h3>
                    <p className="text-muted-foreground text-sm">The project owner has been notified. Good luck!</p>
                </div>
            )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
       {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
