"use client";

import React, { useRef, useEffect, useState, cloneElement, Children } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAnimatorProps {
  children: React.ReactNode;
  className?: string;
}

const useOnScreen = (ref: React.RefObject<HTMLElement>, rootMargin = '0px') => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        rootMargin,
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
};

const ScrollAnimator: React.FC<ScrollAnimatorProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, '-100px');

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-animate-fade-in-up",
        onScreen && "is-visible",
        className
      )}
    >
      {children}
    </div>
  );
};

export default ScrollAnimator;
