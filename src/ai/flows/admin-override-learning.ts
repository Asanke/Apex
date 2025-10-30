'use server';

/**
 * @fileOverview AI-Powered Task Assignment with Admin Override and Learning.
 *
 * This file defines a Genkit flow for AI-powered task assignment, allowing admins to
 * override AI suggestions and provide reasons for the override, which the AI learns from
 * to improve future recommendations.
 *
 * - adminOverrideLearning - The main function to initiate the task assignment process with admin override and AI learning.
 * - AdminOverrideLearningInput - The input type for the adminOverrideLearning function.
 * - AdminOverrideLearningOutput - The output type for the adminOverrideLearning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminOverrideLearningInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to be assigned.'),
  circleMembers: z
    .array(z.object({userId: z.string(), ai_profile: z.any()}))
    .describe('List of members in the circle with their AI profiles.'),
  adminOverride: z
    .boolean()
    .describe('Whether the admin is overriding the AI suggestion.'),
  adminReason: z
    .string()
    .optional()
    .describe('The reason provided by the admin for overriding the AI suggestion.'),
  aiSuggestion: z
    .string()
    .optional()
    .describe('The userId that was the AI suggestion for task assignment'),
  adminChoice: z
    .string()
    .optional()
    .describe('The userId of the member selected by the admin for task assignment'),
});
export type AdminOverrideLearningInput = z.infer<typeof AdminOverrideLearningInputSchema>;

const AdminOverrideLearningOutputSchema = z.object({
  bestFit: z
    .string()
    .describe('The userId of the member who is the best fit for the task.'),
  reason: z.string().describe('The reason for the assignment.'),
  aiProfileUpdateExplanation: z
    .string()
    .optional()
    .describe('Explanation of how AI profile should be updated based on admin override'),
});
export type AdminOverrideLearningOutput = z.infer<typeof AdminOverrideLearningOutputSchema>;

export async function adminOverrideLearning(
  input: AdminOverrideLearningInput
): Promise<AdminOverrideLearningOutput> {
  return adminOverrideLearningFlow(input);
}

const taskAssignmentPrompt = ai.definePrompt({
  name: 'taskAssignmentPrompt',
  input: {schema: AdminOverrideLearningInputSchema},
  output: {schema: AdminOverrideLearningOutputSchema},
  prompt: `Analyze this task: "{{taskDescription}}". Based on these user profiles: \
    {{#each circleMembers}}
      {{this.userId}}: {{this.ai_profile}}
    {{/each}}
  Who is the best fit? Return JSON: {{"best_fit": "userId", "reason": "..."}}
  \
  {% raw %}{{ #if adminOverride }} The admin chose {{adminChoice}} instead of the AI suggestion of {{aiSuggestion}} because {{adminReason}}. Explain how this should update the AI profile for {{adminChoice}} regarding this task's expertise. {% endraw %}{% endraw %}{{/if}}
  `, // VERY IMPORTANT: Handlebars syntax MUST be used.
});

const adminOverrideLearningFlow = ai.defineFlow(
  {
    name: 'adminOverrideLearningFlow',
    inputSchema: AdminOverrideLearningInputSchema,
    outputSchema: AdminOverrideLearningOutputSchema,
  },
  async input => {
    const {output} = await taskAssignmentPrompt(input);
    return output!;
  }
);
