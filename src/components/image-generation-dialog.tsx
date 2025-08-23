
"use client";

import React, { useState, useTransition, useEffect, useRef } from 'react';
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
import { Loader2, Wand2, ImagePlus, Mic } from 'lucide-react';
import { generateImage } from '@/ai/flows/image-generation-flow';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface ImageGenerationDialogProps {
  onAddItem: (type: 'image', content: string) => void;
  children: React.ReactNode;
}

export function ImageGenerationDialog({ onAddItem, children }: ImageGenerationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, startGeneration] = useTransition();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setPrompt(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({ title: 'Speech Recognition Error', description: `An error occurred: ${event.error}`, variant: 'destructive' });
        setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [isOpen, toast]);


  const handleGenerate = () => {
    if (!prompt) {
      toast({ title: 'Prompt required', description: 'Please enter a prompt for the image.', variant: 'destructive' });
      return;
    }
    setGeneratedImage(null);
    startGeneration(async () => {
      try {
        const result = await generateImage({ prompt });
        if (result && result.dataUri) {
          setGeneratedImage(result.dataUri);
        }
      } catch (error) {
        console.error('Failed to generate image', error);
        toast({ title: 'Error', description: 'Could not generate image.', variant: 'destructive' });
      }
    });
  };

  const handleAddToBoard = () => {
    if (generatedImage) {
      onAddItem('image', generatedImage);
      handleClose();
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setPrompt('');
    setGeneratedImage(null);
  };
  
  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Could not start recognition', error);
        toast({ title: 'Could Not Start', description: 'Please check microphone permissions.', variant: 'destructive' });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Image with AI</DialogTitle>
          <DialogDescription>
            Describe the image you want to create. Or click the mic and say it!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="relative">
                <Input
                  id="prompt"
                  placeholder="e.g., 'A majestic lion in a futuristic jungle'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  disabled={isGenerating}
                  className="pr-10"
                />
                 <button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={handleMicClick} disabled={isGenerating}>
                    <Mic className={cn("h-5 w-5 text-muted-foreground hover:text-foreground", isListening && "text-destructive animate-pulse")} />
                </button>
            </div>
          </div>
          <div className="aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground bg-secondary/50">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Generating...</p>
              </div>
            ) : generatedImage ? (
              <Image src={generatedImage} alt="Generated image" width={400} height={400} className="object-contain w-full h-full rounded-md" data-ai-hint={prompt} />
            ) : (
                <div className="text-center p-4">
                    <Wand2 className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">Your image will appear here</p>
                </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
            {generatedImage ? (
                <Button onClick={handleAddToBoard} className="w-full sm:w-auto">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Add to Board
                </Button>
            ) : (
                 <div /> 
            )}
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
