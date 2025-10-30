'use server';

import {
  adminOverrideLearning,
  validateRejectionReason,
} from '@/ai/flows/admin-override-learning';
import { mockUsers } from './data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const getAIAssignmentSuggestionSchema = z.object({
  taskDescription: z.string(),
  circleId: z.string(),
});

export async function getAIAssignmentSuggestion(
  values: z.infer<typeof getAIAssignmentSuggestionSchema>
) {
  // In a real app, you would fetch circle members from the database
  const circleMembers = mockUsers.filter(u => u.circles.includes(values.circleId));
  
  // This is a mocked response, in a real app you would call the AI flow
  // const response = await adminOverrideLearning({
  //   taskDescription: values.taskDescription,
  //   circleMembers: circleMembers.map(m => ({ userId: m.userId, ai_profile: m.ai_profile })),
  //   adminOverride: false,
  // });

  await new Promise(resolve => setTimeout(resolve, 1000));

  const suggestedUser = circleMembers[1] || circleMembers[0];

  return {
    bestFit: suggestedUser.userId,
    reason: `Based on their profile, ${suggestedUser.name} has proven expertise in areas related to this task.`,
  };
}


const rejectTaskSchema = z.object({
    taskId: z.string(),
    reason: z.string(),
    taskDescription: z.string(),
    overrideCode: z.string().optional(),
});

export async function rejectTask(values: z.infer<typeof rejectTaskSchema>) {
    // In a real app, you would validate the override code against the database.
    if (values.overrideCode && values.overrideCode === '4158') {
        console.log(`Task ${values.taskId} rejected with override code.`);
        revalidatePath('/dashboard');
        return { success: true, message: 'Task rejected with override code.' };
    }

    // Mocking the AI validation flow call
    // const validation = await validateRejectionReason({
    //     taskId: values.taskId,
    //     reason: values.reason,
    //     taskDescription: values.taskDescription,
    // });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocked response logic
    const isReasonPoor = /busy|don't want to/i.test(values.reason);
    const validation = {
        isValid: !isReasonPoor,
        feedback: isReasonPoor 
            ? "This is not a sufficient reason. Please specify *which* projects are conflicting or provide more detail."
            : "Reason seems valid."
    };

    if (validation.isValid) {
        console.log(`Task ${values.taskId} rejection is valid.`);
        revalidatePath('/dashboard');
        return { success: true, message: 'Task rejection approved.' };
    } else {
        console.log(`Task ${values.taskId} rejection is invalid.`);
        return { success: false, message: validation.feedback };
    }
}
