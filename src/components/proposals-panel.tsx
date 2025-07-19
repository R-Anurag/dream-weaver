
"use client";

import React from 'react';
import type { Board } from '@/types';
import { Button } from '@/components/ui/button';
import { X, Check, ThumbsDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from './ui/use-toast';

// Sample data for proposals
const sampleProposals = [
  {
    id: 'prop-1',
    userName: 'Alice Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    message: "I'm a UI/UX designer with 5 years of experience in sustainable tech. I love your vision for urban farming and have some ideas for a companion app. Let's connect!",
    status: 'pending',
  },
  {
    id: 'prop-2',
    userName: 'Bob Williams',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    message: "I'm a software engineer and can help build out the backend for your AI education platform. My background is in machine learning and data science.",
    status: 'pending',
  },
  {
    id: 'prop-3',
    userName: 'Charlie Brown',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    message: "Your ocean cleanup initiative is inspiring! I have a background in logistics and grant writing and would love to contribute to the project management.",
    status: 'pending',
  },
];


interface ProposalsPanelProps {
  board: Board;
  onClose: () => void;
}

const ProposalCard = ({ proposal }: { proposal: (typeof sampleProposals)[0] }) => {
    const { toast } = useToast();
    
    const handleAccept = () => {
        toast({ title: "Proposal Accepted!", description: `You have accepted ${proposal.userName}'s proposal.` });
    }

    const handleDecline = () => {
         toast({ title: "Proposal Declined", variant: 'destructive' });
    }
    
    return (
        <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                    <AvatarImage src={proposal.userAvatar} alt={proposal.userName} />
                    <AvatarFallback>{proposal.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{proposal.userName}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{proposal.message}</p>
            </CardContent>
            <CardFooter className="gap-2">
                 <Button size="sm" onClick={handleAccept} className="flex-1">
                    <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline} className="flex-1">
                    <ThumbsDown className="mr-2 h-4 w-4" /> Decline
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function ProposalsPanel({ board, onClose }: ProposalsPanelProps) {
    const isMobile = useIsMobile();

    const content = (
        <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
                {sampleProposals.length > 0 ? (
                    sampleProposals.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No proposals yet.</p>
                        <p className="text-xs">When someone proposes to collaborate, it will appear here.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
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
