
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebar from '@/components/boards-sidebar';
import DreamWeaverClient from '@/components/dream-weaver-client';
import type { Board } from '@/types';
import AuthGuard from '@/components/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WelcomeBoard } from '@/components/dream-weaver-client';


const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchBoards = async () => {
        setIsLoaded(false);
        const q = query(collection(db, 'boards'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userBoards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));

        if (userBoards.length > 0) {
          setBoards(userBoards);
          setActiveBoardId(userBoards[0].id);
        } else {
          // Create a welcome board for new users
          const welcome: Omit<Board, 'id'> = { ...WelcomeBoard, userId: user.uid };
          try {
            const docRef = await addDoc(collection(db, 'boards'), welcome);
            const newBoard = { ...welcome, id: docRef.id };
            setBoards([newBoard]);
            setActiveBoardId(newBoard.id);
          } catch (error) {
              console.error("Error creating welcome board: ", error);
          }
        }
        setIsLoaded(true);
      };
      fetchBoards();
    }
  }, [user]);

  const handleAddBoard = async () => {
    if (!user) return;
    const newBoardData: Omit<Board, 'id'> = {
      name: `New Board ${boards.filter(b => b.name.startsWith("New Board")).length + 1}`,
      items: [],
      userId: user.uid,
    };
    try {
        const docRef = await addDoc(collection(db, 'boards'), newBoardData);
        const newBoard = { ...newBoardData, id: docRef.id };
        setBoards(prevBoards => [...prevBoards, newBoard]);
        setActiveBoardId(newBoard.id);
    } catch (error) {
        console.error("Error adding board: ", error);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
     if (!user) return;
     try {
        await deleteDoc(doc(db, 'boards', boardId));
        setBoards(prevBoards => {
            const newBoards = prevBoards.filter(b => b.id !== boardId);
            if (activeBoardId === boardId) {
                setActiveBoardId(newBoards.length > 0 ? newBoards[0].id : null);
            }
            return newBoards;
        });
     } catch (error) {
        console.error("Error deleting board: ", error);
     }
  };
  
  const handleRenameBoard = async (boardId: string, newName: string) => {
    if (!user) return;
    try {
        const boardRef = doc(db, 'boards', boardId);
        await updateDoc(boardRef, { name: newName });
        setBoards(boards.map(b => b.id === boardId ? {...b, name: newName} : b));
    } catch(error) {
         console.error("Error renaming board: ", error);
    }
  }

  const handleUpdateBoardItems = async (boardId: string, items: Board['items']) => {
    if (!user) return;
    try {
      const boardRef = doc(db, 'boards', boardId);
      await updateDoc(boardRef, { items: items });
       setBoards(prevBoards =>
          prevBoards.map(board =>
            board.id === boardId ? { ...board, items } : board
          )
        );
    } catch (error) {
      console.error("Error updating board items: ", error);
    }
  };
  
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
  }

  return (
    <AuthGuard>
        <div className="flex min-h-svh w-screen bg-background font-body text-foreground overflow-hidden">
            <Sidebar>
                <BoardsSidebar
                boards={boards}
                activeBoardId={activeBoardId}
                onSelectBoard={handleSelectBoard}
                onAddBoard={handleAddBoard}
                onDeleteBoard={handleDeleteBoard}
                onRenameBoard={handleRenameBoard}
                />
            </Sidebar>
            <SidebarInset>
                <DreamWeaverClient
                  key={activeBoardId}
                  board={boards.find(b => b.id === activeBoardId)}
                  onUpdateItems={handleUpdateBoardItems}
                />
            </SidebarInset>
        </div>
    </AuthGuard>
  );
}
