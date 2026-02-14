'use server';
/**
 * @fileOverview Sorts a list of listings based on user preferences and viewing patterns.
 *
 * - smartSortListings - A function that takes a list of listings and user preferences to return a sorted list.
 * - SmartSortListingsInput - The input type for the smartSortListings function.
 * - SmartSortListingsOutput - The return type for the smartSortListings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSortListingsInputSchema = z.object({
  listings: z.array(z.any()).describe('The list of listings to be sorted.'),
  userPreferences: z.string().describe('The previously indicated user preferences.'),
  viewingPatterns: z.string().describe('The user viewing patterns.'),
  hasUnlockedDetails: z.boolean().describe('Whether the user has unlocked the details of the property.'),
});
export type SmartSortListingsInput = z.infer<typeof SmartSortListingsInputSchema>;

const SmartSortListingsOutputSchema = z.array(z.any()).describe('The sorted list of listings.');
export type SmartSortListingsOutput = z.infer<typeof SmartSortListingsOutputSchema>;

export async function smartSortListings(input: SmartSortListingsInput): Promise<SmartSortListingsOutput> {
  return smartSortListingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSortListingsPrompt',
  input: {schema: SmartSortListingsInputSchema},
  output: {schema: SmartSortListingsOutputSchema},
  prompt: `You are an AI expert at prioritizing lists of properties based on user preferences and behavior.
Given the following list of listings, user preferences, and viewing patterns, return a sorted list of listings that are most relevant to the user.
Listings: {{{listings}}}
User Preferences: {{{userPreferences}}}
Viewing Patterns: {{{viewingPatterns}}}
Has Unlocked Details: {{{hasUnlockedDetails}}}
Sort the list based on relevance to the user, considering their preferences, viewing patterns and whether they have unlocked details for the property.`,  
});

const smartSortListingsFlow = ai.defineFlow(
  {
    name: 'smartSortListingsFlow',
    inputSchema: SmartSortListingsInputSchema,
    outputSchema: SmartSortListingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
