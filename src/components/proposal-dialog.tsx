
"use client";

import React, { useState, useEffect, useTransition, useCallback, useRef } from 'react';
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
import type { Board, Proposal } from '@/types';
import { generateProposalHeadings, generateProposalBody } from '@/ai/flows/proposal-flow';
import { useToast } from './ui/use-toast';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

const generateId = () => `prop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const Typewriter = ({ text, onFinished }: { text: string, onFinished: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const animationFrameRef = useRef<number>();
    
    useEffect(() => {
        setDisplayedText(''); // Reset on new text
        let i = 0;
        const animate = () => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                 onFinished();
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [text, onFinished]);

    return (
        <Textarea
            value={displayedText}
            readOnly
            disabled
            className="bg-transparent border-none focus-visible:ring-0 p-0 h-full resize-none text-foreground disabled:cursor-default disabled:opacity-100"
        />
    );
};


export function ProposalDialog({ board }: { board: Board }) {
    const [isOpen, setIsOpen] = useState(false);
    const [headings, setHeadings] = useState<string[]>([]);
    const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0);
    const [proposalBody, setProposalBody] = useState('');
    const [isGeneratingHeadings, startHeadingGeneration] = useTransition();
    const [isGeneratingBody, startBodyGeneration] = useTransition();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const resetState = useCallback(() => {
        setHeadings([]);
        setCurrentHeadingIndex(0);
        setProposalBody('');
        setIsAnimating(false);
        setIsTyping(false);
        if (timeoutRef.current) {
            clearInterval(timeoutRef.current);
        }
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetState();
        }
    };

    const handleNextHeading = useCallback(() => {
        if (headings.length === 0 || isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentHeadingIndex((prev) => (prev + 1) % headings.length);
            setIsAnimating(false);
        }, 500);
    }, [headings.length, isAnimating]);

    useEffect(() => {
        if (isOpen && headings.length > 0) {
            timeoutRef.current = setInterval(() => {
                handleNextHeading();
            }, 5000);
        } else if (!isOpen || headings.length === 0) {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            }
        }
        return () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            }
        };
    }, [isOpen, headings, handleNextHeading]);


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

    const handlePrevHeading = () => {
        if (headings.length === 0 || isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentHeadingIndex((prev) => (prev - 1 + headings.length) % headings.length);
            setIsAnimating(false);
        }, 500);
    };

    const handleGenerateBody = useCallback(() => {
        const selectedHeading = headings[currentHeadingIndex];
        if (!selectedHeading || isGeneratingBody) return;

        setProposalBody('');
        setIsTyping(true); // Set typing to true immediately

        startBodyGeneration(async () => {
            try {
                const result = await generateProposalBody(board, selectedHeading);
                if (result && result.proposal) {
                    setProposalBody(result.proposal);
                }
            } catch (error) {
                console.error("Failed to generate proposal body", error);
                toast({ title: "Error", description: "Could not generate the proposal.", variant: "destructive" });
                setIsTyping(false); // Stop typing on error
            }
        });
    }, [board, currentHeadingIndex, headings, toast, isGeneratingBody]);

    const handleSendProposal = () => {
        // This is a simulation. In a real app, this would send to a server.
        // For now, we'll save it to localStorage to be viewed in the "Inbox".
        const newProposal: Proposal = {
            id: generateId(),
            boardId: board.id,
            userName: 'Local User', // Placeholder name
            userAvatar: `https://i.pravatar.cc/150?u=${generateId()}`, // Placeholder avatar
            message: proposalBody,
            status: 'pending'
        };

        try {
            const key = `proposals_${board.id}`;
            const existingProposalsRaw = localStorage.getItem(key);
            const existingProposals = existingProposalsRaw ? JSON.parse(existingProposalsRaw) : [];
            const updatedProposals = [...existingProposals, newProposal];
            localStorage.setItem(key, JSON.stringify(updatedProposals));
            
            toast({ title: "Proposal Sent!", description: "Your collaboration request has been sent." });
            handleOpenChange(false);
        } catch (error) {
            console.error("Failed to save proposal to localStorage", error);
            toast({ title: "Error", description: "Could not send proposal.", variant: "destructive" });
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleGenerateBody();
        }
    };
    
    const onTypewriterFinish = useCallback(() => {
        setIsTyping(false);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button variant={isMobile ? "ghost" : "default"} size={isMobile ? "icon" : "default"}>
                    <Sparkles className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                    {!isMobile && 'Collaborate'}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[90vw] rounded-lg sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Propose Collaboration</DialogTitle>
                    <DialogDescription>
                        Use our AI assistant to craft the perfect proposal to join the '{board.name}' project.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 md:gap-8 py-4">
                    {/* Step 1: Idea Generation */}
                    <div className="space-y-4" onKeyDown={handleKeyDown} ref={wrapperRef} tabIndex={0}>
                        <h4 className="font-semibold text-sm">1. Choose a Proposal Idea <Badge variant="outline" className="ml-2">TAB</Badge></h4>
                        {isGeneratingHeadings ? (
                            <div className="flex items-center justify-between p-4 border rounded-lg min-h-[100px]">
                                <Skeleton className="h-4 w-10" />
                                <Skeleton className="h-5 w-[200px]" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4 border rounded-lg bg-secondary/50 min-h-[100px]">
                                 <Button variant="ghost" size="icon" onClick={handlePrevHeading} disabled={headings.length === 0}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <p className={cn("text-center font-medium flex-1 px-4 h-12 flex items-center justify-center animate-text-morph", isAnimating ? 'animate-text-morph-out' : 'animate-text-morph-in')}>
                                    {headings[currentHeadingIndex] || "No ideas yet..."}
                                </p>
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
                    
                    <Separator className="my-4 md:hidden" />

                    {/* Step 2: Refine and Send */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">2. Refine & Send</h4>
                         {isGeneratingBody && !proposalBody ? (
                            <div className="space-y-2 border rounded-lg p-4 min-h-[200px]">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                         ) : (
                            <div className="h-[200px] border rounded-lg p-1 bg-secondary/20 relative">
                                {isTyping && proposalBody ? (
                                    <Typewriter text={proposalBody} onFinished={onTypewriterFinish} />
                                ) : (
                                    <Textarea
                                        placeholder="Your proposal will be generated here. You can edit it before sending."
                                        value={proposalBody}
                                        onChange={(e) => setProposalBody(e.target.value)}
                                        className="bg-transparent border-none focus-visible:ring-0 p-3 h-full resize-none"
                                    />
                                )}
                            </div>
                         )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSendProposal} disabled={!proposalBody || isGeneratingBody || isTyping}>
                        Send Proposal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
