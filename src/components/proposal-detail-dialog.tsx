
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
} from '@/components/ui/dialog';
import { useToast } from './ui/use-toast';
import type { Proposal } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface ProposalDetailDialogProps {
  proposal: Proposal;
  children: React.ReactNode;
  onUpdateProposalStatus: (proposalId: string, status: 'accepted' | 'rejected') => void;
}

export function ProposalDetailDialog({ proposal, onUpdateProposalStatus, children }: ProposalDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleUpdateStatus = (status: 'accepted' | 'rejected') => {
    onUpdateProposalStatus(proposal.id, status);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collaboration Proposal</DialogTitle>
           <DialogDescription>
            From <span className="font-medium text-foreground">{proposal.from}</span> for your board: <span className="font-medium text-foreground">{proposal.boardName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${proposal.from}`} alt={proposal.from} />
                    <AvatarFallback>{proposal.from.charAt(0)}</AvatarFallback>
                </Avatar>
                 <div className="p-4 bg-muted rounded-lg border flex-1">
                    <p className="text-muted-foreground">{proposal.message}</p>
                </div>
            </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
            {proposal.status === 'pending' ? (
                <>
                    <Button type="button" variant="outline" onClick={() => handleUpdateStatus('rejected')}>
                        Reject
                    </Button>
                    <Button type="button" onClick={() => handleUpdateStatus('accepted')}>
                        Accept
                    </Button>
                </>
            ) : (
                <Badge variant={proposal.status === 'accepted' ? 'default' : 'destructive'} className="capitalize">{proposal.status}</Badge>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
