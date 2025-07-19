
"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Type, Star, StickyNote, Square, Circle, Menu } from 'lucide-react';
import type { ItemType, ShapeType } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onAddItem: (type: ItemType, content?: string, shape?: ShapeType) => void;
}

export default function Toolbar({ onAddItem }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();


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
    // Reset file input
    if(event.target) {
        event.target.value = "";
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card p-2 rounded-full shadow-lg border border-border flex items-center gap-2">
       <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar" className={cn("md:hidden", !isMobile && "hidden")}>
        <Menu className="h-5 w-5" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Add Image">
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAddItem('text')} aria-label="Add Text">
        <Type className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAddItem('post-it')} aria-label="Add Post-it Note">
        <StickyNote className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Add Shape">
            <Star className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAddItem('shape', '', 'rectangle')}>
            <Square className="mr-2 h-4 w-4" />
            <span>Rectangle</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddItem('shape', '', 'circle')}>
            <Circle className="mr-2 h-4 w-4" />
            <span>Circle</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddItem('shape', '', 'star')}>
            <Star className="mr-2 h-4 w-4" />
            <span>Star</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
