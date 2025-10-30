'use server';

/**
 * @fileOverview Implements the AI-Validated Rejection workflow.
 *
 * - validateRejectionReason - Validates a task rejection reason using AI.
 * - ValidateRejectionReasonInput - The input type for the validateRejectionReason function.
 * - ValidateRejectionReasonOutput - The return type for the validateRejectionReason function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateRejectionReasonInputSchema = z.object({
  taskId: z.string().describe('The ID of the task being rejected.'),
  reason: z.string().describe('The reason provided for rejecting the task.'),
  taskDescription: z.string().describe('The description of the task.'),
});
export type ValidateRejectionReasonInput = z.infer<
  typeof ValidateRejectionReasonInputSchema
>;

const ValidateRejectionReasonOutputSchema = z.object({
  isValid: z.boolean().describe(
    'Whether the rejection reason is valid (true) or not (false).'
  ),
  feedback: z
    .string()
    .describe(
      'Feedback from the AI indicating why the reason is invalid or providing suggestions for improvement.'
    ),
});
export type ValidateRejectionReasonOutput = z.infer<
  typeof ValidateRejectionReasonOutputSchema
>;

export async function validateRejectionReason(
  input: ValidateRejectionReasonInput
): Promise<ValidateRejectionReasonOutput> {
  return validateRejectionReasonFlow(input);
}

const validateRejectionReasonPrompt = ai.definePrompt({
  name: 'validateRejectionReasonPrompt',
  input: {schema: ValidateRejectionReasonInputSchema},
  output: {schema: ValidateRejectionReasonOutputSchema},
  prompt: `Analyze the rejection reason: '{{reason}}' for the task: '{{taskDescription}}'. Is this a valid, actionable business reason (e.g., 'conflict with priority project X', 'missing critical info Y') or an insufficient reason (e.g., 'too busy', 'I don't want to')? Respond with JSON: {\"is_valid\": true/false, \"feedback\": \"...\"}.  The feedback should be constructive and helpful if the reason is not valid, providing specific guidance on how to improve the reason. Make sure the \"is_valid\" and \"feedback\" keys are present.`,
});

const validateRejectionReasonFlow = ai.defineFlow(
  {
    name: 'validateRejectionReasonFlow',
    inputSchema: ValidateRejectionReasonInputSchema,
    outputSchema: ValidateRejectionReasonOutputSchema,
  },
  async input => {
    const {output} = await validateRejectionReasonPrompt(input);
    return output!;
  }
);
