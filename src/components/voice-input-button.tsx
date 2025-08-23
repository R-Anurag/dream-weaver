
"use client";

import React from 'react';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onStart?: () => void;
  className?: string;
  iconClassName?: string;
  tooltipContent?: React.ReactNode;
}

export function VoiceInputButton({ 
  onTranscript, 
  onStart,
  className,
  iconClassName,
  tooltipContent = "Start Voice Input"
}: VoiceInputButtonProps) {
  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
    onStop: (finalTranscript) => {
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    },
    onStart: onStart,
  });

  const handleToggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  const button = (
    <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggleListening}
        className={cn("h-7 w-7", isListening && 'text-destructive animate-pulse', className)}
    >
        <Mic className={cn("h-4 w-4", iconClassName)} />
    </Button>
  );

  if (!tooltipContent) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Stop Listening' : tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
