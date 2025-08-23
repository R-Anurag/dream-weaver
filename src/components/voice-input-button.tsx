
"use client";

import React from 'react';
import { Wand2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className }: VoiceInputButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition({
    onStop: (finalTranscript) => {
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    },
  });

  const handleToggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleListening}
            className={cn("h-7 w-7", isListening && 'text-destructive animate-pulse', className)}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Stop Listening' : 'Start Voice Input'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
