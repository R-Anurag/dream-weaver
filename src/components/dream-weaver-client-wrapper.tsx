"use client";

import React, { useState, useEffect } from 'react';
import DreamWeaverClient from './dream-weaver-client';
import type { Board } from '@/types';

// This component acts as a wrapper to get the state from the sidebar
// which is unfortunately necessary because they are rendered in different parts of the tree.
export default function DreamWeaverClientWrapper() {
    const [state, setState] = useState<{ boards: Board[], setBoards: (b: Board[]) => void, activeBoardId: string | null, setActiveBoardId: (id: string|null) => void} | null>(null);

    useEffect(() => {
        // Use an interval to check for the global state.
        // This is a workaround for the fact that the sidebar and the main content
        // are rendered in different parts of the tree and we need to share state.
        const interval = setInterval(() => {
            if ((window as any).__DREAM_WEAVER_BOARDS_STATE) {
                setState((window as any).__DREAM_WEAVER_BOARDS_STATE);
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    if (!state) {
        return <div className="flex-1 flex items-center justify-center"><p>Loading boards...</p></div>;
    }

    return <DreamWeaverClient {...state} />;
}
