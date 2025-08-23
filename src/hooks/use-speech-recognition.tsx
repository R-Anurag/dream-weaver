
"use client";

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionOptions {
  onStop?: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onStop }: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
            // In continuous mode, it can sometimes stop. Restart it.
            recognition.start();
        } else {
            // If stopped manually, trigger the callback
            setTranscript(prev => {
                if (onStop) {
                    onStop(prev);
                }
                return prev;
            });
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
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Reset transcript on start
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // onStop is called via the onend handler
    }
  };

  return { isListening, transcript, startListening, stopListening, isSupported };
};
