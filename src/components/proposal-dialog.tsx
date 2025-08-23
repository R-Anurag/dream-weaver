
"use client";

import React, { useState, useTransition, useEffect, useCallback } from 'react';
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
import { Loader2, Wand2, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateProposalBody, generateProposalHeadings } from '@/ai/flows/proposal-flow';
import { useToast } from './ui/use-toast';
import type { Board } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface ProposalDialogProps {
  board: Board;
  children: React.ReactNode;
}

const useTypewriter = (initialText: string = '', speed: number = 50) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const type = useCallback((text: string) => {
        setIsTyping(true);
        setDisplayText('');
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, speed);
    }, [speed]);

    return { displayText, type, isTyping };
};


export function ProposalDialog({ board, children }: ProposalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<string[]>([]);
  const [selectedHeadingIndex, setSelectedHeadingIndex] = useState(0);
  const [proposalBody, setProposalBody] = useState('');
  const [isGenerating, startGeneration] = useTransition();
  const [isBodyLoading, setIsBodyLoading] = useState(false);
  
  const { toast } = useToast();
  const { displayText: typedBody, type: typeBody, isTyping } = useTypewriter();
  
  const currentHeading = headings[selectedHeadingIndex];

  useEffect(() => {
    if (isOpen) {
      handleGenerateHeadings();
    } else {
      // Reset state when dialog is closed
      setTimeout(() => {
        setHeadings([]);
        setSelectedHeadingIndex(0);
        setProposalBody('');
      }, 300);
    }
  }, [isOpen]);
  
   useEffect(() => {
    if (typedBody) {
      setProposalBody(typedBody);
    }
  }, [typedBody]);


  const handleGenerateHeadings = () => {
    setHeadings([]);
    startGeneration(async () => {
      try {
        const result = await generateProposalHeadings(board);
        if (result && result.headings) {
          setHeadings(result.headings);
          setSelectedHeadingIndex(0);
        }
      } catch (error) {
        console.error('Failed to generate headings', error);
        toast({ title: 'Error', description: 'Could not generate proposal ideas.', variant: 'destructive' });
      }
    });
  };
  
  const handleGenerateBody = () => {
      if (!currentHeading) return;
      
      setIsBodyLoading(true);
      setProposalBody('');
      startGeneration(async () => {
         try {
            const result = await generateProposalBody(board, currentHeading);
            if (result && result.proposal) {
                typeBody(result.proposal);
            }
         } catch (error) {
            console.error('Failed to generate proposal body', error);
            toast({ title: 'Error', description: 'Could not generate proposal body.', variant: 'destructive' });
         } finally {
             setIsBodyLoading(false);
         }
      });
  }
  
  const handleNextHeading = () => {
      setSelectedHeadingIndex(prev => (prev + 1) % headings.length);
  }
  
  const handlePrevHeading = () => {
      setSelectedHeadingIndex(prev => (prev - 1 + headings.length) % headings.length);
  }

  const handleSendProposal = () => {
    setIsOpen(false);
    toast({ title: 'Success!', description: 'Your collaboration proposal has been sent.' });
  };
  
  const renderContent = () => {
    if (isGenerating && headings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Generating Ideas</DialogTitle>
                    <DialogDescription>The AI is generating proposal ideas.</DialogDescription>
                </DialogHeader>
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Generating Ideas...</h3>
                <p className="text-muted-foreground text-sm">Our AI is crafting some catchy proposal starters for your project.</p>
            </div>
        );
    }
    
    return (
        <>
        <DialogHeader className="p-6 pb-0 md:p-8 md:pb-0">
            <DialogTitle className="text-2xl">Craft a Collaboration Proposal</DialogTitle>
            <DialogDescription>
                Use our AI to generate ideas, then craft the perfect message to the project owner.
            </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 md:p-8 min-h-0">
            {/* Left Section */}
            <div className="flex-1 md:w-2/5 flex flex-col gap-4 bg-muted/50 p-6 rounded-lg border">
                <div className="space-y-1">
                    <Label className="text-sm font-semibold">AI-Generated Ideas</Label>
                    <p className="text-sm text-muted-foreground">Select a starter to build your proposal.</p>
                </div>
                 {isGenerating ? (
                    <Skeleton className="w-full h-24" />
                 ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-background rounded-md min-h-[100px]">
                        <p className="font-medium text-lg">{currentHeading}</p>
                    </div>
                 )}
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={handlePrevHeading} disabled={isGenerating || headings.length === 0}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{selectedHeadingIndex + 1} / {headings.length}</span>
                    <Button variant="outline" size="icon" onClick={handleNextHeading} disabled={isGenerating || headings.length === 0}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={handleGenerateHeadings} disabled={isGenerating} size="sm" variant="ghost">
                    <Sparkles className="mr-2 h-4 w-4" /> Regenerate Ideas
                </Button>
            </div>

            {/* Right Section */}
            <div className="flex-1 md:w-3/5 flex flex-col gap-4">
                 <div className="flex-1 flex flex-col">
                    <Label htmlFor="proposal-body" className="text-sm font-semibold mb-2">Your Proposal</Label>
                    <Textarea
                        id="proposal-body"
                        placeholder="Click 'Generate' to create a proposal from the selected idea, or write your own from scratch."
                        value={proposalBody}
                        onChange={(e) => setProposalBody(e.target.value)}
                        rows={10}
                        className={cn("text-base flex-1 resize-none", isTyping && "typewriter-text")}
                        disabled={isTyping || isBodyLoading}
                    />
                 </div>
                 {isBodyLoading && !isTyping && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating proposal body...
                    </div>
                 )}
            </div>
        </div>
        <DialogFooter className="p-6 pt-0 md:p-8 md:pt-0 flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
            <Button onClick={handleGenerateBody} disabled={isGenerating || isBodyLoading || isTyping || !currentHeading} className="w-full sm:w-auto">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
            </Button>
            <Button onClick={handleSendProposal} disabled={isTyping || !proposalBody} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Send Proposal
            </Button>
        </DialogFooter>
        </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
       {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
