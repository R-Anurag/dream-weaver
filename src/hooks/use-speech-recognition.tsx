
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onStop?: (transcript: string) => void;
  onStart?: () => void;
}

export const useSpeechRecognition = ({ onStop, onStart }: SpeechRecognitionOptions = {}) => {
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
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + finalTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        handleStop();
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
  }, [handleStop]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); 
      if (onStart) {
        onStart();
      }
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
