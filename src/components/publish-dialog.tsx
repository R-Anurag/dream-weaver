
"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import { Rocket, Copy, Check, Save, Upload } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';

interface PublishDialogProps {
  board: Board | undefined;
  children: React.ReactNode;
  onUpdateBoard: (boardId: string, updates: Partial<Omit<Board, 'id'>>) => Promise<Board>;
}

export function PublishDialog({ board, children, onUpdateBoard }: PublishDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(board?.published || false);
  const [shareableLink, setShareableLink] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [flairs, setFlairs] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const { toast } = useToast();
  
  useEffect(() => {
    if (board) {
      setIsPublished(board.published || false);
      setDescription(board.description || '');
      setTags((board.tags || []).join(', '));
      setFlairs((board.flairs || []).join(', '));
      setThumbnailUrl(board.thumbnailUrl || '');

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
    }
  };
  
  const handleSaveChanges = async () => {
    if (!board) return;
    
    const updatedBoardDetails = {
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        flairs: flairs.split(',').map(f => f.trim()).filter(Boolean),
        published: isPublished,
        thumbnailUrl: thumbnailUrl
    }

    try {
        await onUpdateBoard(board.id, updatedBoardDetails);
        toast({ title: "Changes Saved!", description: "Your board details have been updated."});
        if (isPublished) {
            toast({ title: "Board Published!", description: "Anyone with the link can now view your board." });
        } else {
            toast({ title: "Board Unpublished", description: "Your board is now private." });
        }
        setIsOpen(false);
    } catch(error) {
        toast({ title: "Error Saving", description: "Could not save your changes. Please try again.", variant: "destructive" });
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
         <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
        />
        <ScrollArea className="flex-1 min-h-0">
            <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/20 relative">
                            {thumbnailUrl ? (
                                <Image src={thumbnailUrl} alt="Cover image preview" layout="fill" objectFit="cover" className="rounded-md" />
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-sm">No cover image selected</p>
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe your vision board..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                {/* Right Column */}
                <div className="space-y-6">
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
                    <div className="flex items-center space-x-4 rounded-lg border p-4 h-fit mt-6">
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
