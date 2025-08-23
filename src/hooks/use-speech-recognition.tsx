
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onStop?: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onStop }: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleStop = useCallback(() => {
      setTranscript(prev => {
          if (onStop) {
              onStop(prev);
          }
          return prev;
      });
  }, [onStop]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + (finalTranscript.startsWith(prev) ? finalTranscript.substring(prev.length) : finalTranscript));
      };
      
      recognition.onend = () => {
        if (isListening) {
            recognition.start();
        } else {
            handleStop();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, handleStop]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); 
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening, isSupported };
};
