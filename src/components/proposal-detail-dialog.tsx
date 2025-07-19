
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ThumbsDown, Eye, PenSquare, MessageSquare, Handshake } from 'lucide-react';
import { useToast } from './ui/use-toast';
import type { Proposal } from '@/types';

interface ProposalDetailDialogProps {
  proposal: Proposal;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAccept: (proposalId: string) => void;
  onDecline: (proposalId: string) => void;
}

type AccessLevel = 'view' | 'comment' | 'edit';

export function ProposalDetailDialog({ proposal, isOpen, onOpenChange, onAccept, onDecline }: ProposalDetailDialogProps) {
  const [showAccessLevels, setShowAccessLevels] = useState(false);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('view');
  const { toast } = useToast();

  const handleAcceptClick = () => {
    setShowAccessLevels(true);
  };
  
  const handleConfirmAccept = () => {
    onAccept(proposal.id);
    toast({
      title: 'Collaboration Accepted!',
      description: `${proposal.userName} can now ${accessLevel} this board.`,
    });
    onOpenChange(false);
    setShowAccessLevels(false); // Reset for next time
  };

  const handleDeclineClick = () => {
    onDecline(proposal.id);
    toast({
      title: 'Proposal Declined',
      description: `You have declined the proposal from ${proposal.userName}.`,
      variant: 'destructive',
    });
    onOpenChange(false);
    setShowAccessLevels(false);
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowAccessLevels(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={proposal.userAvatar} alt={proposal.userName} />
            <AvatarFallback>{proposal.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle>{proposal.userName}</DialogTitle>
            <DialogDescription>Wants to collaborate with you.</DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <Label>Proposal Message</Label>
          <Textarea readOnly value={proposal.message} rows={6} className="mt-2 bg-secondary/50" />
        </div>
        
        {showAccessLevels ? (
            <div className="py-4 space-y-4 animate-fade-in-up">
                <Label>Grant Access Level</Label>
                 <RadioGroup value={accessLevel} onValueChange={(value: AccessLevel) => setAccessLevel(value)}>
                    <Label className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:bg-accent/20 has-[:checked]:border-accent cursor-pointer">
                        <RadioGroupItem value="view" id="view" />
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">View Only</p>
                            <p className="text-xs text-muted-foreground">Can see the board but not make changes.</p>
                        </div>
                    </Label>
                    <Label className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:bg-accent/20 has-[:checked]:border-accent cursor-pointer">
                        <RadioGroupItem value="comment" id="comment" />
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Can Comment</p>
                            <p className="text-xs text-muted-foreground">Can view and add comments to items.</p>
                        </div>
                    </Label>
                    <Label className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:bg-accent/20 has-[:checked]:border-accent cursor-pointer">
                        <RadioGroupItem value="edit" id="edit" />
                        <PenSquare className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Can Edit</p>
                            <p className="text-xs text-muted-foreground">Full access to modify the board.</p>
                        </div>
                    </Label>
                 </RadioGroup>
            </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
            {showAccessLevels ? (
                 <Button onClick={handleConfirmAccept} className="w-full sm:w-auto">
                    <Handshake className="mr-2 h-4 w-4" />
                    Confirm Collaboration
                </Button>
            ) : (
                <>
                    <Button onClick={handleAcceptClick} className="w-full sm:w-auto">
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                    </Button>
                     <Button variant="destructive" onClick={handleDeclineClick} className="w-full sm:w-auto">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Decline
                    </Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
