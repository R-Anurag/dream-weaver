
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Board } from '@/types';
import { X } from 'lucide-react';
import { Badge } from './ui/badge';

interface PublishDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    board: Board;
    onPublish: (details: Partial<Board>) => void;
}

export function PublishDialog({ isOpen, onOpenChange, board, onPublish }: PublishDialogProps) {
    const [description, setDescription] = useState(board.description || '');
    const [tags, setTags] = useState<string[]>(board.tags || []);
    const [flairs, setFlairs] = useState<string[]>(board.flairs || []);
    const [currentTag, setCurrentTag] = useState('');
    const [currentFlair, setCurrentFlair] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDescription(board.description || '');
            setTags(board.tags || []);
            setFlairs(board.flairs || []);
        }
    }, [isOpen, board]);

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
        onPublish({ description, tags, flairs });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{board.published ? 'Update Board' : 'Publish Board'}</DialogTitle>
                    <DialogDescription>
                       Add details to your board to make it discoverable. What is your vision?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your vision board..." />
                    </div>
                    <div className="grid gap-2">
                         <Label htmlFor="tags">Tags (comma-separated)</Label>
                         <Input id="tags" placeholder="e.g., sustainability, art, tech" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'tag')} />
                         <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px] max-h-[80px] overflow-y-auto">
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
                         <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md min-h-[40px] max-h-[80px] overflow-y-auto">
                            {flairs.map((flair, index) => (
                                <Badge key={index} variant="default" className="bg-accent text-accent-foreground">
                                    {flair}
                                    <button onClick={() => removeChip(index, 'flair')} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handlePublishClick}>
                        {board.published ? 'Update & Publish' : 'Publish'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
