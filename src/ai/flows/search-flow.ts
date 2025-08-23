
'use server';
/**
 * @fileOverview An AI flow for performing semantic search on vision boards.
 *
 * - searchBoards - Ranks boards based on a natural language query.
 * - SearchBoardsInput - The input type for the searchBoards function.
 * - SearchBoardsOutput - The return type for the searchBoards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Board } from '@/types';

const BoardInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const SearchBoardsInputSchema = z.object({
  query: z.string().describe("The user's natural language search query."),
  boards: z.array(BoardInfoSchema).describe("The list of available boards to search through."),
});
export type SearchBoardsInput = z.infer<typeof SearchBoardsInputSchema>;

const SearchBoardsOutputSchema = z.object({
  rankedBoardIds: z.array(z.string()).describe("An array of board IDs, ordered by relevance to the user's query."),
});
export type SearchBoardsOutput = z.infer<typeof SearchBoardsOutputSchema>;


export async function searchBoards(query: string, boards: Board[]): Promise<SearchBoardsOutput> {
  const boardInfo = boards.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    tags: b.tags,
  }));
  
  return searchBoardsFlow({ query, boards: boardInfo });
}


const searchPrompt = ai.definePrompt({
  name: 'searchBoardsPrompt',
  input: {schema: SearchBoardsInputSchema},
  output: {schema: SearchBoardsOutputSchema},
  prompt: `You are an intelligent search engine for a vision board application called Dream Weaver. Your task is to rank the provided boards based on their relevance to the user's search query.

Consider the board's name, description, and tags. The query is in natural language, so you should consider semantic relevance, not just keyword matching. For example, a query for "helping the planet" should rank boards about "sustainability" or "ocean cleanup" highly.

User Query: "{{query}}"

Available Boards (JSON format):
{{{json boards}}}

Analyze the query and the boards, then return an array of board IDs in the 'rankedBoardIds' field, ordered from most to least relevant. Only include IDs from the provided list.
`,
});


const searchBoardsFlow = ai.defineFlow(
  {
    name: 'searchBoardsFlow',
    inputSchema: SearchBoardsInputSchema,
    outputSchema: SearchBoardsOutputSchema,
  },
  async (input) => {
    const {output} = await searchPrompt(input);
    return output!;
  }
);
