
"use client";

import React, { useState, useEffect } from 'react';
import type { Board, Proposal } from '@/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sampleProposals } from '@/lib/sample-data';
import { ProposalDetailDialog } from './proposal-detail-dialog';

interface ProposalsPanelProps {
  board: Board;
  onClose: () => void;
}

const ProposalCard = ({ proposal, onSelect }: { proposal: Proposal, onSelect: () => void }) => {
    return (
        <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer" onClick={onSelect}>
            <CardHeader className="flex flex-row items-start gap-4 p-4">
                <Avatar>
                    <AvatarImage src={proposal.userAvatar} alt={proposal.userName} />
                    <AvatarFallback>{proposal.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-base">{proposal.userName}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{proposal.message}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    )
}

export default function ProposalsPanel({ board, onClose }: ProposalsPanelProps) {
    const isMobile = useIsMobile();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    useEffect(() => {
        // Load proposals from localStorage for this specific board
        const storedProposals = localStorage.getItem(`proposals_${board.id}`);
        const localProposals = storedProposals ? JSON.parse(storedProposals) : [];
        
        // Combine sample proposals and local proposals, giving local ones precedence
        const allProposals = [...localProposals, ...sampleProposals.filter(sp => !localProposals.some((lp: Proposal) => lp.id === sp.id))];
        setProposals(allProposals);

    }, [board.id]);
    
    const handleDecline = (proposalId: string) => {
        setProposals(prev => prev.filter(p => p.id !== proposalId));
        setSelectedProposal(null);
    };

    const handleAccept = (proposalId: string) => {
        // Future logic for accepting will go here
        setSelectedProposal(null);
    };

    const content = (
        <>
            <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                    {proposals.length > 0 ? (
                        proposals.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} onSelect={() => setSelectedProposal(proposal)} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No proposals yet.</p>
                            <p className="text-xs">When someone proposes to collaborate, it will appear here.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
             {selectedProposal && (
                <ProposalDetailDialog
                    proposal={selectedProposal}
                    isOpen={!!selectedProposal}
                    onOpenChange={(isOpen) => !isOpen && setSelectedProposal(null)}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                />
            )}
        </>
    );

    if (isMobile) {
        return <div className="flex-1 flex flex-col">{content}</div>
    }

    return (
        <aside className="w-full md:w-80 bg-card md:border-l md:border-border flex flex-col md:shadow-md z-20">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold font-headline text-lg">Proposals Inbox</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
            {content}
        </aside>
    );
}
