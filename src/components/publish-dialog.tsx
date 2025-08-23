
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from './ui/use-toast';
import type { Board } from '@/types';
import { Rocket, Copy, Check, Save } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

interface PublishDialogProps {
  board: Board | undefined;
  children: React.ReactNode;
}

export function PublishDialog({ board, children }: PublishDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(board?.published || false);
  const [shareableLink, setShareableLink] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  
  // New states for board metadata
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [flairs, setFlairs] = useState('');

  const { toast } = useToast();
  
  useEffect(() => {
    if (board) {
      setIsPublished(board.published || false);
      setDescription(board.description || '');
      setTags((board.tags || []).join(', '));
      setFlairs((board.flairs || []).join(', '));

      if (board.published) {
        setShareableLink(`${window.location.origin}/boards/view/${board.id}`);
      }
    }
  }, [board, isOpen]);

  const handlePublishToggle = (published: boolean) => {
    if (!board) return;
    setIsPublished(published);
    if (published) {
      setShareableLink(`${window.location.origin}/boards/view/${board.id}`);
      toast({ title: "Board Published!", description: "Anyone with the link can now view your board." });
    } else {
       toast({ title: "Board Unpublished", description: "Your board is now private." });
    }
    // In a real app, this would trigger a state update in the parent.
    console.log("Toggled published status to:", published);
  };
  
  const handleSaveChanges = () => {
    if (!board) return;
    // In a real app, you would call an `onUpdateBoard` prop function.
    const updatedBoardDetails = {
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        flairs: flairs.split(',').map(f => f.trim()).filter(Boolean),
        published: isPublished
    }
    console.log("Saving changes:", updatedBoardDetails);
    toast({ title: "Changes Saved!", description: "Your board details have been updated."});
    setIsOpen(false);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  if (!board) return <>{children}</>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Publish & Share</DialogTitle>
          <DialogDescription>
            Edit your board's public details and publish it to the world.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0">
            <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe your vision board..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input 
                            id="tags" 
                            placeholder="e.g., sustainability, community, tech"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="flairs">Flairs (comma-separated)</Label>
                        <Input 
                            id="flairs" 
                            placeholder="e.g., Featured, Top 5%"
                            value={flairs}
                            onChange={(e) => setFlairs(e.target.value)}
                        />
                    </div>
                </div>
                {/* Right Column */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-4 rounded-lg border p-4 h-fit">
                        <Rocket className="h-6 w-6 text-primary" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            Publish to web
                            </p>
                            <p className="text-sm text-muted-foreground">
                            Allow anyone to view your board.
                            </p>
                        </div>
                        <Switch
                            id="publish-switch"
                            checked={isPublished}
                            onCheckedChange={handlePublishToggle}
                        />
                    </div>

                    {isPublished && (
                        <div className="space-y-2 animate-fade-in-up">
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
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t bg-background">
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
