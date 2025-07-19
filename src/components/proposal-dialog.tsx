
"use client";

import React, { useState, useEffect, useTransition } from 'react';
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
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import type { Board } from '@/types';
import { generateProposalHeadings, generateProposalBody } from '@/ai/flows/proposal-flow';
import { useToast } from './ui/use-toast';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ProposalDialog({ board }: { board: Board }) {
    const [isOpen, setIsOpen] = useState(false);
    const [headings, setHeadings] = useState<string[]>([]);
    const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0);
    const [proposalBody, setProposalBody] = useState('');
    const [isGeneratingHeadings, startHeadingGeneration] = useTransition();
    const [isGeneratingBody, startBodyGeneration] = useTransition();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isOpen && board) {
            startHeadingGeneration(async () => {
                try {
                    const result = await generateProposalHeadings(board);
                    if (result && result.headings) {
                        setHeadings(result.headings);
                    }
                } catch (error) {
                    console.error("Failed to generate headings", error);
                    toast({ title: "Error", description: "Could not generate proposal ideas.", variant: "destructive" });
                }
            });
        }
    }, [isOpen, board, toast]);

    const handleNextHeading = () => {
        setCurrentHeadingIndex((prev) => (prev + 1) % headings.length);
    };

    const handlePrevHeading = () => {
        setCurrentHeadingIndex((prev) => (prev - 1 + headings.length) % headings.length);
    };

    const handleGenerateBody = () => {
        const selectedHeading = headings[currentHeadingIndex];
        if (!selectedHeading) return;

        startBodyGeneration(async () => {
            try {
                const result = await generateProposalBody(board, selectedHeading);
                if (result && result.proposal) {
                    setProposalBody(result.proposal);
                }
            } catch (error) {
                console.error("Failed to generate proposal body", error);
                toast({ title: "Error", description: "Could not generate the proposal.", variant: "destructive" });
            }
        });
    };

    const handleSendProposal = () => {
        console.log("Sending proposal:", proposalBody);
        toast({ title: "Proposal Sent!", description: "Your collaboration request has been sent." });
        setIsOpen(false);
        setProposalBody('');
        setHeadings([]);
        setCurrentHeadingIndex(0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant={isMobile ? "ghost" : "default"} size={isMobile ? "icon" : "default"}>
                    <Sparkles className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                    {!isMobile && 'Collaborate'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Propose Collaboration</DialogTitle>
                    <DialogDescription>
                        Use our AI assistant to craft the perfect proposal to join the '{board.name}' project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">1. Choose a Proposal Idea</h4>
                        {isGeneratingHeadings ? (
                            <div className="flex items-center justify-between p-4 border rounded-lg h-[68px]">
                                <Skeleton className="h-4 w-10" />
                                <Skeleton className="h-5 w-[200px]" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                                <Button variant="ghost" size="icon" onClick={handlePrevHeading} disabled={headings.length === 0}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <p className="text-center font-medium flex-1 px-4">{headings[currentHeadingIndex] || "No ideas yet..."}</p>
                                <Button variant="ghost" size="icon" onClick={handleNextHeading} disabled={headings.length === 0}>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                         <Button onClick={handleGenerateBody} disabled={isGeneratingBody || headings.length === 0} className="w-full">
                            {isGeneratingBody ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Elaborate on this idea
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">2. Refine & Send</h4>
                         {isGeneratingBody ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                         ) : (
                            <Textarea
                                placeholder="Your proposal will be generated here. You can edit it before sending."
                                value={proposalBody}
                                onChange={(e) => setProposalBody(e.target.value)}
                                rows={8}
                            />
                         )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendProposal} disabled={!proposalBody || isGeneratingBody}>
                        Send Proposal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
