
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Board } from '@/types';
import { X, Upload } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { VoiceInputButton } from './voice-input-button';


interface PublishDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    board: Board;
    onPublish: (details: Partial<Board>) => void;
    children: React.ReactNode;
}

const PublishForm = ({ board, onFormChange, isOpen }: { board: Board, onFormChange: (details: Partial<Board>) => void, isOpen: boolean }) => {
    const [description, setDescription] = useState(board.description || '');
    const [tags, setTags] = useState<string[]>(board.tags || []);
    const [flairs, setFlairs] = useState<string[]>(board.flairs || []);
    const [currentTag, setCurrentTag] = useState('');
    const [currentFlair, setCurrentFlair] = useState('');
    const [thumbnail, setThumbnail] = useState<string | null>(board.thumbnailUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        // This effect now resets the form state whenever the dialog is opened.
        if (isOpen) {
            setDescription(board.description || '');
            setTags(board.tags || []);
            setFlairs(board.flairs || []);
            setThumbnail(board.thumbnailUrl || null);
        }
    }, [isOpen, board]);

    useEffect(() => {
        // This effect syncs changes back to the parent component.
        const details: Partial<Board> = { description, tags, flairs, thumbnailUrl: thumbnail };
        onFormChange(details);
    }, [description, tags, flairs, thumbnail, onFormChange]);

    const addChip = (value: string, type: 'tag' | 'flair') => {
        if (value) {
            if (type === 'tag' && !tags.includes(value)) {
                setTags(prev => [...prev, value]);
                setCurrentTag('');
            } else if (type === 'flair' && !flairs.includes(value)) {
                setFlairs(prev => [...prev, value]);
                setCurrentFlair('');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'tag' | 'flair') => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            addChip(value, type);
        }
    };
    
    const removeChip = (index: number, type: 'tag' | 'flair') => {
        if (type === 'tag') {
            setTags(tags.filter((_, i) => i !== index));
        } else {
            setFlairs(flairs.filter((_, i) => i !== index));
        }
    }
    
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
                        <Image src={thumbnail} alt="Thumbnail preview" width={320} height={180} className="object-cover w-full h-full rounded-md" data-ai-hint="vision board" />
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
                <div className="grid gap-2 relative">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your vision board..." />
                    <VoiceInputButton onTranscript={setDescription} className="absolute right-3 top-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <div className="relative">
                        <Input id="tags" placeholder="e.g., sustainability, art, tech" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'tag')} className="pr-10" />
                        <VoiceInputButton onTranscript={(t) => addChip(t, 'tag')} className="absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
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
                    <div className="relative">
                        <Input id="flairs" placeholder="e.g., Design, Funding, Engineering" value={currentFlair} onChange={(e) => setCurrentFlair(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'flair')} className="pr-10" />
                         <VoiceInputButton onTranscript={(t) => addChip(t, 'flair')} className="absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
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
        </div>
    );
}

export function PublishDialog({ isOpen, onOpenChange, board, onPublish, children }: PublishDialogProps) {
    const [formState, setFormState] = useState<Partial<Board>>({});

    const handlePublishClick = () => {
        onPublish(formState);
        onOpenChange(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-3xl w-[90vw] rounded-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{board.published ? 'Update Board' : 'Publish Board'}</DialogTitle>
                    <DialogDescription>
                       Add details to your board to make it discoverable. What is your vision?
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="pr-4 -mr-6">
                    <PublishForm board={board} onFormChange={setFormState} isOpen={isOpen} />
                </ScrollArea>
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handlePublishClick} className="w-full sm:w-auto">
                        {board.published ? 'Update & Publish' : 'Publish'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
