
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from './ui/use-toast';
import type { Board } from '@/types';
import { Rocket, Copy, Check } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface PublishDialogProps {
  board: Board | undefined;
  children: React.ReactNode;
}

export function PublishDialog({ board, children }: PublishDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(board?.published || false);
  const [shareableLink, setShareableLink] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (board) {
      setIsPublished(board.published || false);
      if (board.published) {
        setShareableLink(`${window.location.origin}/boards/view/${board.id}`);
      }
    }
  }, [board, isOpen]);

  const handlePublishToggle = (published: boolean) => {
    if (!board) return;
    setIsPublished(published);
    if (published) {
      // In a real app, you'd update the backend here.
      // For now, we'll just generate the link.
      setShareableLink(`${window.location.origin}/boards/view/${board.id}`);
      toast({ title: "Board Published!", description: "Anyone with the link can now view your board." });
    } else {
       toast({ title: "Board Unpublished", description: "Your board is now private." });
    }
    // Here you would call a function to update the board's published status in your state/DB.
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  if (!board) return <>{children}</>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish & Share</DialogTitle>
          <DialogDescription>
            Publish your board to get a shareable, view-only link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
            <div className="flex items-center space-x-4 rounded-lg border p-4">
                <Rocket className="h-6 w-6 text-primary" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                    Publish to web
                    </p>
                    <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to view your board.
                    </p>
                </div>
                <Switch
                    checked={isPublished}
                    onCheckedChange={handlePublishToggle}
                />
            </div>

            {isPublished && (
                <div className="space-y-2">
                    <Label htmlFor="link">Shareable Link</Label>
                    <div className="flex space-x-2">
                        <Input id="link" value={shareableLink} readOnly />
                        <Button type="button" size="icon" variant="secondary" onClick={copyToClipboard}>
                            {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
