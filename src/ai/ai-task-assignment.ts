'use server';

/**
 * @fileOverview AI-Powered Task Assignment Flow.
 *
 * This file defines a Genkit flow that automatically assigns tasks to the
 * best-suited user based on their AI profile and the task description.
 *
 * @exports assignTask - An async function that initiates the task assignment process.
 * @exports AssignTaskInput - The input type for the assignTask function.
 * @exports AssignTaskOutput - The return type for the assignTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const AssignTaskInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to be assigned.'),
  circleMembers: z.array(
    z.object({
      userId: z.string().describe('The user ID of a member in the circle.'),
      aiProfile: z
        .object({
          expertise: z.array(z.string()).describe('The areas of expertise of the user.'),
          successRate: z
            .number()
            .min(0)
            .max(1)
            .describe('The success rate of the user in completing tasks.'),
        })
        .describe('The AI profile of the user.'),
    })
  ).describe('List of members in the circle with their AI profiles.'),
});
export type AssignTaskInput = z.infer<typeof AssignTaskInputSchema>;

const AssignTaskOutputSchema = z.object({
  bestFitUserId: z.string().describe('The user ID of the best fit for the task.'),
  reason: z.string().describe('The reason why the user was chosen.'),
});
export type AssignTaskOutput = z.infer<typeof AssignTaskOutputSchema>;

export async function assignTask(input: AssignTaskInput): Promise<AssignTaskOutput> {
  return assignTaskFlow(input);
}

const assignTaskPrompt = ai.definePrompt({
  name: 'assignTaskPrompt',
  input: {schema: AssignTaskInputSchema},
  output: {schema: AssignTaskOutputSchema},
  prompt: `You are an AI assistant that suggests the best user to assign a task to.

  Analyze the following task description: {{{taskDescription}}}.

  Based on the following user profiles, determine who is the best fit for the task.

  {% each circleMembers %}
  User ID: {{this.userId}}
  Expertise: {{this.aiProfile.expertise}}
  Success Rate: {{this.aiProfile.successRate}}
  {% endeach %}

  Return a JSON object with the following format:
  {
    "bestFitUserId": "userId",
    "reason": "reason why the user was chosen"
  }`,
});

const assignTaskFlow = ai.defineFlow(
  {
    name: 'assignTaskFlow',
    inputSchema: AssignTaskInputSchema,
    outputSchema: AssignTaskOutputSchema,
  },
  async input => {
    const {output} = await assignTaskPrompt(input);
    return output!;
  }
);
