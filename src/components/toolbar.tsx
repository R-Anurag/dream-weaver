
"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Type, Star, StickyNote, Square, Circle, Pencil, Eraser, Wand2 } from 'lucide-react';
import type { ItemType, ShapeType } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { ImageGenerationDialog } from './image-generation-dialog';

interface ToolbarProps {
  onAddItem: (type: ItemType, content?: string, shape?: ShapeType) => void;
  activeTool: 'select' | 'pencil' | 'eraser';
  onSetTool: (tool: 'select' | 'pencil' | 'eraser') => void;
}

export default function Toolbar({ onAddItem, activeTool, onSetTool }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


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
        onAddItem('image', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if(event.target) {
        event.target.value = "";
    }
  };

  const shapeMenuItems = [
    { shape: 'rectangle' as ShapeType, icon: Square, label: 'Rectangle' },
    { shape: 'circle' as ShapeType, icon: Circle, label: 'Circle' },
    { shape: 'star' as ShapeType, icon: Star, label: 'Star' }
  ];

  const handleAddItemAndSelect = (type: ItemType, content?: string, shape?: ShapeType) => {
      onAddItem(type, content, shape);
      onSetTool('select');
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-card p-2 rounded-full shadow-lg border border-border flex items-center gap-1">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <Button variant={activeTool === 'pencil' ? 'secondary' : 'ghost'} size="icon" onClick={() => onSetTool('pencil')} aria-label="Pencil">
        <Pencil className="h-5 w-5" />
      </Button>
      <Button variant={activeTool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => onSetTool('eraser')} aria-label="Eraser">
        <Eraser className="h-5 w-5" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Add Image">
        <ImageIcon className="h-5 w-5" />
      </Button>
       <ImageGenerationDialog onAddItem={handleAddItemAndSelect}>
           <Button variant="ghost" size="icon" aria-label="Generate Image">
                <Wand2 className="h-5 w-5" />
           </Button>
       </ImageGenerationDialog>
      <Button variant="ghost" size="icon" onClick={() => handleAddItemAndSelect('text')} aria-label="Add Text">
        <Type className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleAddItemAndSelect('post-it')} aria-label="Add Post-it Note">
        <StickyNote className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Add Shape">
            <Star className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
           {shapeMenuItems.map(({ shape, icon: Icon, label }) => (
            <DropdownMenuItem key={shape} onClick={() => handleAddItemAndSelect('shape', '', shape)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
