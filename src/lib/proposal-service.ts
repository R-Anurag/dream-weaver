
'use client';

/**
 * @fileoverview A mock service for managing collaboration proposals.
 * This service simulates asynchronous database operations for creating,
 * reading, and updating proposals, using localStorage for persistence.
 */

import type { Proposal } from '@/types';

const PROPOSAL_STORAGE_KEY = 'dreamWeaverProposals';

// Helper function to generate a unique ID
const generateId = () => `prop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- MOCK DATABASE HELPER FUNCTIONS ---

// Simulates a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAllProposalsFromStorage = (): Proposal[] => {
  try {
    const saved = localStorage.getItem(PROPOSAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to read proposals from localStorage", error);
    return [];
  }
};

const saveProposalsToStorage = (proposals: Proposal[]) => {
  try {
    localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(proposals));
  } catch (error) {
    console.error("Failed to save proposals to localStorage", error);
  }
};

// --- PUBLIC SERVICE FUNCTIONS ---

/**
 * Fetches all proposals for a specific board.
 * @param boardId The ID of the board to fetch proposals for.
 * @returns A promise that resolves to an array of proposals.
 */
export async function getProposals(boardId: string): Promise<Proposal[]> {
  await delay(100);
  const allProposals = getAllProposalsFromStorage();
  return allProposals.filter(p => p.boardId === boardId);
}

/**
 * Creates a new proposal.
 * @param proposalData The data for the new proposal.
 * @returns A promise that resolves to the newly created proposal.
 */
export async function createProposal(proposalData: Omit<Proposal, 'id' | 'status' | 'timestamp'>): Promise<Proposal> {
  await delay(150);
  const allProposals = getAllProposalsFromStorage();
  const newProposal: Proposal = {
    ...proposalData,
    id: generateId(),
    status: 'pending',
    timestamp: Date.now(),
  };
  const newProposals = [...allProposals, newProposal];
  saveProposalsToStorage(newProposals);
  return newProposal;
}

/**
 * Updates the status of an existing proposal.
 * @param proposalId The ID of the proposal to update.
 * @param status The new status ('accepted' or 'rejected').
 * @returns A promise that resolves to the updated proposal.
 */
export async function updateProposalStatus(proposalId: string, status: 'accepted' | 'rejected'): Promise<Proposal> {
  await delay(100);
  const allProposals = getAllProposalsFromStorage();
  let updatedProposal: Proposal | undefined;
  const newProposals = allProposals.map(proposal => {
    if (proposal.id === proposalId) {
      updatedProposal = { ...proposal, status };
      return updatedProposal;
    }
    return proposal;
  });

  if (!updatedProposal) {
    throw new Error('Proposal not found');
  }

  saveProposalsToStorage(newProposals);
  return updatedProposal;
}
