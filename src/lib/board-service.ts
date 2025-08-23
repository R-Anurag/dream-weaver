
'use client';

/**
 * @fileoverview A mock service for managing vision boards.
 * This service simulates asynchronous database operations for creating,
 * reading, updating, and deleting boards, using localStorage for
 * client-side persistence. This prepares the app for a real
 * database integration (e.g., Firestore) in the future.
 */

import type { Board, CanvasItem } from '@/types';
import { WelcomeBoard } from '@/components/dream-weaver-client';

const STORAGE_KEY = 'dreamWeaverBoards';

// Helper function to generate a unique ID
const generateId = () => `board-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- MOCK DATABASE HELPER FUNCTIONS ---

// Simulates a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getBoardsFromStorage = (): Board[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to read from localStorage", error);
  }
  // If nothing is saved, create a welcome board
  const welcome: Board = { ...WelcomeBoard, id: generateId() };
  return [welcome];
};

const saveBoardsToStorage = (boards: Board[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};


// --- PUBLIC SERVICE FUNCTIONS ---

/**
 * Fetches all boards.
 * @returns A promise that resolves to an array of boards.
 */
export async function getBoards(): Promise<Board[]> {
  await delay(200); // Simulate network latency
  return getBoardsFromStorage();
}

/**
 * Creates a new board.
 * @returns A promise that resolves to the newly created board.
 */
export async function createBoard(): Promise<Board> {
  await delay(150);
  const boards = getBoardsFromStorage();
  const newBoard: Board = {
    id: generateId(),
    name: `New Board ${boards.filter(b => b.name.startsWith("New Board")).length + 1}`,
    items: [],
  };
  const newBoards = [...boards, newBoard];
  saveBoardsToStorage(newBoards);
  return newBoard;
}

/**
 * Updates an existing board's properties (e.g., name, items).
 * @param boardId The ID of the board to update.
 * @param updates A partial board object with the fields to update.
 * @returns A promise that resolves to the updated board.
 */
export async function updateBoard(boardId: string, updates: Partial<Omit<Board, 'id'>>): Promise<Board> {
  await delay(100);
  const boards = getBoardsFromStorage();
  let updatedBoard: Board | undefined;
  const newBoards = boards.map(board => {
    if (board.id === boardId) {
      updatedBoard = { ...board, ...updates };
      return updatedBoard;
    }
    return board;
  });
  if (!updatedBoard) {
    throw new Error('Board not found');
  }
  saveBoardsToStorage(newBoards);
  return updatedBoard;
}

/**
 * Deletes a board.
 * @param boardId The ID of the board to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export async function deleteBoard(boardId: string): Promise<void> {
  await delay(100);
  const boards = getBoardsFromStorage();
  const newBoards = boards.filter(board => board.id !== boardId);
  saveBoardsToStorage(newBoards);
}
