
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
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Board } from '@/types';
import { X, Upload } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


interface PublishDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    board: Board;
    onPublish: (details: Partial<Board>) => void;
    children: React.ReactNode;
}

const PublishForm = ({ board, onPublish }: { board: Board, onPublish: (details: Partial<Board>) => void }) => {
    const [description, setDescription] = useState(board.description || '');
    const [tags, setTags] = useState<string[]>(board.tags || []);
    const [flairs, setFlairs] = useState<string[]>(board.flairs || []);
    const [currentTag, setCurrentTag] = useState('');
    const [currentFlair, setCurrentFlair] = useState('');
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        setDescription(board.description || '');
        setTags(board.tags || []);
        setFlairs(board.flairs || []);
        setThumbnail(board.thumbnailUrl || null);
    }, [board]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'tag' | 'flair') => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
                if (type === 'tag' && !tags.includes(value)) {
                    setTags([...tags, value]);
                    setCurrentTag('');
                } else if (type === 'flair' && !flairs.includes(value)) {
                    setFlairs([...flairs, value]);
                    setCurrentFlair('');
                }
            }
        }
    };
    
    const removeChip = (index: number, type: 'tag' | 'flair') => {
        if (type === 'tag') {
            setTags(tags.filter((_, i) => i !== index));
        } else {
            setFlairs(flairs.filter((_, i) => i !== index));
        }
    }

    const handlePublishClick = () => {
        onPublish({ description, tags, flairs, thumbnailUrl: thumbnail || undefined });
    };
    
    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({
              title: "Image too large",
              description: "Please select an image smaller than 2MB.",
              variant: "destructive",
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            setThumbnail(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
        if(event.target) {
            event.target.value = "";
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 py-4">
             <div className="grid gap-2 items-start">
                <Label htmlFor="thumbnail" className="md:col-span-2">Thumbnail Image</Label>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "cursor-pointer aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors",
                        thumbnail && "border-solid"
                    )}
                >
                    {thumbnail ? (
                        <Image src={thumbnail} alt="Thumbnail preview" width={320} height={180} className="object-cover w-full h-full rounded-md" />
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="mx-auto h-8 w-8" />
                            <p className="mt-2 text-sm">Click to upload</p>
                            <p className="text-xs">Recommended: 16:9, max 2MB</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your vision board..." />
                </div>
                <div className="grid gap-2">
                     <Label htmlFor="tags">Tags (comma-separated)</Label>
                     <Input id="tags" placeholder="e.g., sustainability, art, tech" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'tag')} />
                     <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[40px] max-h-[80px] overflow-y-auto">
                        {tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                                {tag}
                                <button onClick={() => removeChip(index, 'tag')} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                            </Badge>
                        ))}
                    </div>
                </div>
                 <div className="grid gap-2">
                     <Label htmlFor="flairs">Seeking Skills (comma-separated)</Label>
                     <Input id="flairs" placeholder="e.g., Design, Funding, Engineering" value={currentFlair} onChange={(e) => setCurrentFlair(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'flair')} />
                     <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md min-h-[40px] max-h-[80px] overflow-y-auto">
                        {flairs.map((flair, index) => (
                            <Badge key={index} variant="default" className="bg-accent text-accent-foreground">
                                {flair}
                                <button onClick={() => removeChip(index, 'flair')} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
             <DialogFooter className="md:col-span-2">
                <Button onClick={handlePublishClick} className="w-full md:w-auto">
                    {board.published ? 'Update & Publish' : 'Publish'}
                </Button>
            </DialogFooter>
        </div>
    );
}

export function PublishDialog({ isOpen, onOpenChange, board, onPublish, children }: PublishDialogProps) {
    const isMobile = useIsMobile();
    
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>{children}</SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[90vh] flex flex-col">
                    <SheetHeader className="p-4 text-left">
                        <SheetTitle>{board.published ? 'Update Board' : 'Publish Board'}</SheetTitle>
                        <SheetDescription>
                           Add details to your board to make it discoverable.
                        </SheetDescription>
                    </SheetHeader>
                     <div className="flex-1 overflow-y-auto px-4">
                        <PublishForm board={board} onPublish={(details) => { onPublish(details); onOpenChange(false); }} />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{board.published ? 'Update Board' : 'Publish Board'}</DialogTitle>
                    <DialogDescription>
                       Add details to your board to make it discoverable. What is your vision?
                    </DialogDescription>
                </DialogHeader>
                <PublishForm board={board} onPublish={(details) => { onPublish(details); onOpenChange(false); }} />
            </DialogContent>
        </Dialog>
    );
}
