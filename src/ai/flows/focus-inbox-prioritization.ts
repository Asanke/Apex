'use server';

/**
 * @fileOverview This file defines the Genkit flow for prioritizing items in the Admin's Focus Inbox.
 *
 * - prioritizeFocusInbox - A function that prioritizes inbox items based on urgency and importance.
 * - FocusInboxInput - The input type for the prioritizeFocusInbox function.
 * - FocusInboxOutput - The return type for the prioritizeFocusInbox function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FocusInboxInputSchema = z.object({
  pendingApprovals: z
    .array(z.string())
    .describe('List of task IDs awaiting admin approval.'),
  aiIdentifiedBottlenecks: z
    .array(z.string())
    .describe('List of task IDs identified by AI as bottlenecks.'),
  changeRequests: z
    .array(z.string())
    .describe('List of task IDs with pending change requests.'),
  failureToReachAlerts: z
    .array(z.string())
    .describe('List of user IDs that the system failed to reach.'),
  aiSuggestions: z
    .array(z.string())
    .describe('List of task IDs with AI suggestions.'),
});
export type FocusInboxInput = z.infer<typeof FocusInboxInputSchema>;

const FocusInboxOutputSchema = z.object({
  prioritizedItems: z
    .array(z.string())
    .describe('A list of item IDs, prioritized by urgency and importance.'),
});
export type FocusInboxOutput = z.infer<typeof FocusInboxOutputSchema>;

export async function prioritizeFocusInbox(
  input: FocusInboxInput
): Promise<FocusInboxOutput> {
  return prioritizeFocusInboxFlow(input);
}

const prioritizeFocusInboxPrompt = ai.definePrompt({
  name: 'prioritizeFocusInboxPrompt',
  input: {schema: FocusInboxInputSchema},
  output: {schema: FocusInboxOutputSchema},
  prompt: `You are an AI assistant specializing in prioritizing tasks for a business administrator's focus inbox.

  Given the following lists of items, rank them by urgency and importance to the administrator.
  Prioritize items requiring immediate action, potential bottlenecks, and critical alerts.

  Pending Approvals: {{{pendingApprovals}}}
  AI-Identified Bottlenecks: {{{aiIdentifiedBottlenecks}}}
  Change Requests: {{{changeRequests}}}
  Failure to Reach Alerts: {{{failureToReachAlerts}}}
  AI Suggestions: {{{aiSuggestions}}}

  Return a single, prioritized list of item IDs.
  Output should be a JSON array of strings.
  `,
});

const prioritizeFocusInboxFlow = ai.defineFlow(
  {
    name: 'prioritizeFocusInboxFlow',
    inputSchema: FocusInboxInputSchema,
    outputSchema: FocusInboxOutputSchema,
  },
  async input => {
    const {output} = await prioritizeFocusInboxPrompt(input);
    return output!;
  }
);
