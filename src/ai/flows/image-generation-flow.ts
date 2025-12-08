
'use server';
/**
 * @fileOverview An AI flow for generating images from text prompts.
 *
 * - generateImage - Generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  dataUri: z
    .string()
    .nullable()
    .describe(
      "The generated image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'. Can be null if generation fails."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}


const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    try {
      let { operation } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.prompt,
      });

      if (!operation) {
        console.error('Image generation failed to produce an operation.');
        return { dataUri: null };
      }

      // Wait until the operation completes.
      while (!operation.done) {
        operation = await ai.checkOperation(operation);
        // Sleep for 1 second before checking again.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (operation.error) {
        console.error('Image generation operation failed:', operation.error);
        return { dataUri: null };
      }

      const media = operation.output?.message?.content.find((p) => !!p.media);
      if (!media || !media.media?.url) {
        console.error('Image generation failed to produce a media object in the final operation.');
        return { dataUri: null };
      }
      
      return { dataUri: media.media.url };

    } catch (error) {
        console.error("An error occurred during image generation:", error);
        return { dataUri: null };
    }
  }
);
