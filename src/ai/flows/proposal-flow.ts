
'use server';
/**
 * @fileOverview AI flows for generating collaboration proposals.
 *
 * - generateProposalHeadings - Generates one-liner proposal ideas.
 * - generateProposalBody - Generates a full proposal from a heading.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Board } from '@/types';

// Input Schema for generating headings
const ProposalHeadingsInputSchema = z.object({
  name: z.string().describe("The name of the vision board project."),
  description: z.string().describe("The description of the vision board project."),
  tags: z.array(z.string()).describe("A list of tags associated with the project."),
});
export type ProposalHeadingsInput = z.infer<typeof ProposalHeadingsInputSchema>;

// Output Schema for generating headings
const ProposalHeadingsOutputSchema = z.object({
  headings: z.array(z.string()).length(5).describe("An array of 5 unique, one-liner proposal headings."),
});
export type ProposalHeadingsOutput = z.infer<typeof ProposalHeadingsOutputSchema>;


// Input schema for generating the proposal body
const ProposalBodyInputSchema = z.object({
    name: z.string().describe("The name of the vision board project."),
    description: z.string().describe("The description of the vision board project."),
    tags: z.array(z.string()).describe("A list of tags associated with the project."),
    heading: z.string().describe("The selected heading to expand upon."),
});
export type ProposalBodyInput = z.infer<typeof ProposalBodyInputSchema>;

// Output schema for generating the proposal body
const ProposalBodyOutputSchema = z.object({
    proposal: z.string().describe("The full collaboration proposal, written in 10-20 lines."),
});
export type ProposalBodyOutput = z.infer<typeof ProposalBodyOutputSchema>;


// Wrapper function for the headings flow
export async function generateProposalHeadings(board: Board): Promise<ProposalHeadingsOutput> {
  return generateProposalHeadingsFlow({
    name: board.name,
    description: board.description || '',
    tags: board.tags || [],
  });
}

// Wrapper function for the body flow
export async function generateProposalBody(board: Board, heading: string): Promise<ProposalBodyOutput> {
    return generateProposalBodyFlow({
        name: board.name,
        description: board.description || '',
        tags: board.tags || [],
        heading: heading
    });
}


const headingsPrompt = ai.definePrompt({
  name: 'generateProposalHeadingsPrompt',
  input: {schema: ProposalHeadingsInputSchema},
  output: {schema: ProposalHeadingsOutputSchema},
  prompt: `You are an expert at crafting compelling collaboration proposals. Based on the following project details, generate 5 distinct and catchy one-liner headings for a collaboration proposal.

Project Name: {{{name}}}
Project Description: {{{description}}}
Project Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const generateProposalHeadingsFlow = ai.defineFlow(
  {
    name: 'generateProposalHeadingsFlow',
    inputSchema: ProposalHeadingsInputSchema,
    outputSchema: ProposalHeadingsOutputSchema,
  },
  async input => {
    const {output} = await headingsPrompt(input);
    return output!;
  }
);


const bodyPrompt = ai.definePrompt({
    name: 'generateProposalBodyPrompt',
    input: {schema: ProposalBodyInputSchema},
    output: {schema: ProposalBodyOutputSchema},
    prompt: `You are an expert at crafting compelling collaboration proposals. Expand on the following heading to write a full proposal (10-20 lines) based on the project details. Be persuasive and clearly state the value of collaboration.

Project Name: {{{name}}}
Project Description: {{{description}}}
Project Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Selected Heading: {{{heading}}}
`,
});

const generateProposalBodyFlow = ai.defineFlow(
    {
        name: 'generateProposalBodyFlow',
        inputSchema: ProposalBodyInputSchema,
        outputSchema: ProposalBodyOutputSchema,
    },
    async input => {
        const {output} = await bodyPrompt(input);
        return output!;
    }
);
