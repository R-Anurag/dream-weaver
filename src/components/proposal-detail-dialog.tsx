
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ThumbsDown, Eye, PenSquare, MessageSquare, Handshake, CirclePause } from 'lucide-react';
import { useToast } from './ui/use-toast';
import type { Proposal, AccessLevel } from '@/types';
import { ScrollArea } from './ui/scroll-area';

interface ProposalDetailDialogProps {
  proposal: Proposal;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateProposal: (proposal: Proposal) => void;
}

export function ProposalDetailDialog({ proposal, isOpen, onOpenChange, onUpdateProposal }: ProposalDetailDialogProps) {
  const [showAccessLevels, setShowAccessLevels] = useState(false);
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setShowAccessLevels(false);
      setAccessLevel(null);
    }
  }, [isOpen]);

  const handleAcceptClick = () => {
    setShowAccessLevels(true);
  };
  
  const handleConfirmAccept = () => {
    if (!accessLevel) {
        toast({ title: "Access level required", description: "Please select an access level for the collaborator.", variant: "destructive" });
        return;
    }
    onUpdateProposal({ ...proposal, status: 'accepted', accessLevel });
    toast({
      title: 'Collaboration Accepted!',
      description: `${proposal.userName} can now ${accessLevel} this board.`,
    });
    onOpenChange(false);
  };

  const handleDeclineClick = () => {
    onUpdateProposal({ ...proposal, status: 'declined' });
    toast({
      title: 'Proposal Declined',
      description: `You have declined the proposal from ${proposal.userName}.`,
      variant: "destructive"
    });
    onOpenChange(false);
  };

  const handleMarkConsidering = () => {
    onUpdateProposal({ ...proposal, status: 'considering' });
    toast({
      title: 'Proposal Marked for Consideration',
      description: `You can review this proposal again later.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={proposal.userAvatar} alt={proposal.userName} />
            <AvatarFallback>{proposal.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle>Collaboration Proposal from {proposal.userName}</DialogTitle>
            <DialogDescription>Review the proposal and decide on the next steps.</DialogDescription>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-4 space-y-4">
            <Label>Proposal Message</Label>
            <Textarea readOnly value={proposal.message} rows={6} className="mt-2 bg-secondary/50" />
          
            {showAccessLevels && (
                <div className="space-y-4 animate-fade-in-up">
                    <Label>Grant Access Level</Label>
                    <RadioGroup value={accessLevel || ''} onValueChange={(value: AccessLevel) => setAccessLevel(value)}>
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
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 flex-col sm:flex-row sm:justify-between pt-4">
            {showAccessLevels ? (
                 <Button onClick={handleConfirmAccept} disabled={!accessLevel} className="w-full sm:w-auto">
                    <Handshake className="mr-2 h-4 w-4" />
                    Confirm Collaboration
                </Button>
            ) : (
                <div className="w-full flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                     <div className="flex gap-2">
                        <Button onClick={handleAcceptClick} className="flex-1 sm:flex-auto">
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                        </Button>
                        <Button variant="destructive" onClick={handleDeclineClick} className="flex-1 sm:flex-auto">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Decline
                        </Button>
                     </div>
                     <DialogClose asChild>
                        <Button variant="ghost" onClick={handleMarkConsidering}>
                            <CirclePause className="mr-2 h-4 w-4" />
                            Consider Later
                        </Button>
                     </DialogClose>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
