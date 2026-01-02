
"use client";

import React from 'react';
import type { Proposal } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';

interface ProposalsPanelProps {
  proposals: Proposal[];
  onUpdateProposalStatus: (proposalId: string, status: 'accepted' | 'rejected') => void;
  onClose?: () => void;
}

const ProposalCard = ({ proposal, onUpdateProposalStatus }: { proposal: Proposal, onUpdateProposalStatus: (proposalId: string, status: 'accepted' | 'rejected') => void }) => {
  const isPending = proposal.status === 'pending';

  return (
    <div className="bg-secondary/50 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={`https://i.pravatar.cc/150?u=${proposal.from}`} alt={proposal.from} />
          <AvatarFallback>{proposal.from.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">{proposal.from}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(proposal.timestamp), { addSuffix: true })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{proposal.message}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end items-center gap-2">
        {isPending ? (
          <>
            <Button size="sm" variant="outline" onClick={() => onUpdateProposalStatus(proposal.id, 'rejected')}>
              <X className="h-4 w-4 mr-2" /> Reject
            </Button>
            <Button size="sm" onClick={() => onUpdateProposalStatus(proposal.id, 'accepted')}>
              <Check className="h-4 w-4 mr-2" /> Accept
            </Button>
          </>
        ) : (
          <Badge variant={proposal.status === 'accepted' ? 'secondary' : 'destructive'} className="capitalize bg-background">
            {proposal.status}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function ProposalsPanel({ proposals, onUpdateProposalStatus, onClose }: ProposalsPanelProps) {
    const isMobile = useIsMobile();
    const sortedProposals = [...proposals].sort((a, b) => b.timestamp - a.timestamp);
    const pendingProposals = sortedProposals.filter(p => p.status === 'pending');
    const otherProposals = sortedProposals.filter(p => p.status !== 'pending');

    const content = (
        <>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {pendingProposals.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Pending ({pendingProposals.length})</h3>
                            <div className="space-y-3">
                                {pendingProposals.map(p => <ProposalCard key={p.id} proposal={p} onUpdateProposalStatus={onUpdateProposalStatus} />)}
                            </div>
                        </div>
                    )}
                     {otherProposals.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Archived</h3>
                            <div className="space-y-3">
                                {otherProposals.map(p => <ProposalCard key={p.id} proposal={p} onUpdateProposalStatus={onUpdateProposalStatus} />)}
                            </div>
                        </div>
                    )}
                    {proposals.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No collaboration proposals yet.</p>
                            <p className="text-xs">When someone wants to collaborate, it will show up here.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </>
    );

    return (
        <aside className="w-full md:w-80 bg-card md:border-l md:border-border flex flex-col md:shadow-md z-20">
            <div className="flex justify-between items-center p-4 border-b">
                {isMobile && <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="h-4 w-4" /></Button>}
                <h3 className="font-bold font-headline text-lg">Collaboration Proposals</h3>
                {!isMobile && <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>}
            </div>
            {content}
        </aside>
    );
}
