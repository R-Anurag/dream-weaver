
"use client";

import React, { useState } from 'react';
import type { Board, Proposal, AccessLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { X, UserCheck, CirclePause, PenSquare, MessageSquare, Eye, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProposalDetailDialog } from './proposal-detail-dialog';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


interface ProposalsPanelProps {
  board: Board;
  proposals: Proposal[];
  onUpdateProposal: (proposal: Proposal) => void;
  onClose: () => void;
}

const statusStyles: { [key in Proposal['status']]: string } = {
    pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    accepted: 'bg-green-500/20 text-green-700 border-green-500/30',
    declined: 'bg-red-500/20 text-red-700 border-red-500/30',
    considering: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

const accessLevelIcons: { [key in AccessLevel]: React.ElementType } = {
  edit: PenSquare,
  comment: MessageSquare,
  view: Eye,
};

const ProposalStatusBadge = ({ status, accessLevel }: { status: Proposal['status'], accessLevel?: AccessLevel | null }) => {
    if (status === 'accepted' && accessLevel) {
        const Icon = accessLevelIcons[accessLevel];
        return (
             <Badge variant="outline" className={cn("capitalize pointer-events-none", statusStyles[status])}>
                <UserCheck className="mr-1.5 h-3 w-3" />
                Collaborator
            </Badge>
        )
    }
     if (status === 'considering') {
        return (
             <Badge variant="outline" className={cn("capitalize pointer-events-none", statusStyles[status])}>
                <CirclePause className="mr-1.5 h-3 w-3" />
                Considering
            </Badge>
        )
    }
    return (
        <Badge variant="outline" className={cn("capitalize pointer-events-none", statusStyles[status])}>
            {status}
        </Badge>
    );
};

const ProposalCard = ({ proposal, onSelect }: { proposal: Proposal, onSelect: () => void }) => {
    const timeAgo = proposal.createdAt ? formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true }) : '';
    
    return (
        <Card className="bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer" onClick={onSelect}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={proposal.userAvatar} alt={proposal.userName} />
                        <AvatarFallback>{proposal.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <p className="font-semibold text-sm">{proposal.userName}</p>
                           <ProposalStatusBadge status={proposal.status} accessLevel={proposal.accessLevel} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{proposal.message}</p>
                        {timeAgo && (
                            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{timeAgo}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProposalsPanel({ board, proposals, onUpdateProposal, onClose }: ProposalsPanelProps) {
    const isMobile = useIsMobile();
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    const sortedProposals = [...proposals].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const content = (
        <>
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                    {sortedProposals.length > 0 ? (
                        sortedProposals.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} onSelect={() => setSelectedProposal(proposal)} />)
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
                    onUpdateProposal={onUpdateProposal}
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
