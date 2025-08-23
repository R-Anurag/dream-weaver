
"use client";

import React from 'react';
import type { CanvasItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertiesPanelProps {
  item: CanvasItem;
  onUpdateItem: (item: CanvasItem) => void;
  onDeleteItem: () => void;
  onClose: () => void;
}

const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
    const colors = ['#FFFFFF', '#E6E6FA', '#FFFACD', '#FFB380', '#ADD8E6', '#90EE90', '#FFC0CB', '#C0C0C0', '#000000'];
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="w-8 h-8">
                    <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: color }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-5 gap-1">
                    {colors.map(c => (
                        <Button key={c} variant="outline" size="icon" className={cn("w-8 h-8", color === c && "ring-2 ring-ring")} onClick={() => onChange(c)}>
                            <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: c }} />
                        </Button>
                    ))}
                    <Input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 p-1" />
                </div>
            </PopoverContent>
        </Popover>
    );
};


export default function PropertiesPanel({ item, onUpdateItem, onDeleteItem, onClose }: PropertiesPanelProps) {
    const updateStyle = (key: string, value: any) => {
        onUpdateItem({ ...item, style: { ...item.style, [key]: value } });
    };
    const isMobile = useIsMobile();

    const content = (
        <>
            <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                    {(item.type === 'text' || item.type === 'post-it' || item.type === 'shape') && (
                         item.type !== 'post-it' && <div className="flex items-center justify-between">
                            <Label>Background</Label>
                            <ColorPicker color={item.style.backgroundColor} onChange={(c) => updateStyle('backgroundColor', c)} />
                        </div>
                    )}
                    {(item.type === 'text' || item.type === 'post-it') && (
                        <>
                            <div className="flex items-center justify-between">
                               <Label>Text Color</Label>
                               <ColorPicker color={item.style.color} onChange={(c) => updateStyle('color', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Font Size</Label>
                                <Input type="number" value={item.style.fontSize} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))} className="w-20 h-8" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Align</Label>
                                <div className="flex items-center gap-1">
                                    <Button variant={item.style.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => updateStyle('textAlign', 'left')}><AlignLeft className="h-4 w-4" /></Button>
                                    <Button variant={item.style.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => updateStyle('textAlign', 'center')}><AlignCenter className="h-4 w-4" /></Button>
                                    <Button variant={item.style.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => updateStyle('textAlign', 'right')}><AlignRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </>
                    )}
                    {item.type === 'shape' && (
                         <>
                            <div className="flex items-center justify-between">
                               <Label>Border Color</Label>
                               <ColorPicker color={item.style.borderColor} onChange={(c) => updateStyle('borderColor', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Border Width</Label>
                                <Input type="number" value={item.style.borderWidth} min="0" max="20" onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))} className="w-20 h-8" />
                            </div>
                        </>
                    )}
                     <div className="flex items-center justify-between">
                        <Label>Rotation</Label>
                        <Input type="number" value={Math.round(item.rotation)} onChange={(e) => onUpdateItem({...item, rotation: parseInt(e.target.value)})} className="w-20 h-8" />
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t">
                <Button variant="destructive" size="sm" className="w-full" onClick={onDeleteItem}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Item
                </Button>
            </div>
        </>
    );

    if (isMobile) {
        return <div className="flex-1 flex flex-col">{content}</div>
    }

    return (
        <aside className="w-full md:w-72 bg-card md:border-l md:border-border flex flex-col md:shadow-md z-20">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold font-headline text-lg capitalize">{item.type} Properties</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
            {content}
        </aside>
    );
}

    
