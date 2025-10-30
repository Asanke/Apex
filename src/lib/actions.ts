'use server';

import {
  adminOverrideLearning,
  type AdminOverrideLearningInput,
} from '@/ai/flows/admin-override-learning';
import {
  assignTask,
  type AssignTaskInput,
  type AssignTaskOutput,
} from '@/ai/ai-task-assignment';
import {
  validateRejectionReason,
  type ValidateRejectionReasonInput,
} from '@/ai/flows/ai-validated-rejection';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { User, Circle, Task } from '@/lib/types';
import { useUser } from '@/firebase/provider';

// IMPORTANT: This is a temporary solution to get unblocked.
// The ideal solution is to use the Admin SDK in a secure environment.
const getDb = () => {
  const { firestore } = initializeFirebase();
  return firestore;
};

const getAIAssignmentSuggestionSchema = z.object({
  taskDescription: z.string(),
  circleId: z.string(),
});

export async function getAIAssignmentSuggestion(
  values: z.infer<typeof getAIAssignmentSuggestionSchema>
): Promise<AssignTaskOutput> {
  try {
    const db = getDb();
    const circleRef = doc(db, 'circles', values.circleId);
    const circleDoc = await getDoc(circleRef);

    if (!circleDoc.exists()) {
      throw new Error('Circle not found');
    }

    const circleData = circleDoc.data() as Circle;
    const memberIds = circleData.members.map(m => m.userId);

    const users: { userId: string; aiProfile: any }[] = [];
    for (const userId of memberIds) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        users.push({
          userId: userDoc.id,
          aiProfile: userData.ai_profile,
        });
      }
    }

    const response = await assignTask({
      taskDescription: values.taskDescription,
      circleMembers: users.map(u => ({
        userId: u.userId,
        aiProfile: {
          expertise: u.aiProfile.expertise || [],
          successRate: u.aiProfile.success_rate || 0,
        },
      })),
    });

    return response;
  } catch (error) {
    console.error('AI assignment failed, using fallback:', error);
    // Fallback to simple logic if AI fails
    return {
      bestFitUserId: 'fallback',
      reason: 'AI assignment failed, manual assignment recommended'
    };
  }
}

const createTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  circleId: z.string(),
  assignedTo: z.string(),
  assignedBy: z.string(),
  overrideLog: z
    .object({
      overridden: z.boolean(),
      originalSuggestion: z.string(),
      finalChoice: z.string(),
      adminReason: z.string(),
    })
    .optional(),
});

export async function createTask(
  values: z.infer<typeof createTaskSchema>
) {
  const db = getDb();
  try {
    await addDoc(collection(db, `circles/${values.circleId}/tasks`), {
      ...values,
      status: 'pending_acceptance',
      createdAt: serverTimestamp(),
      log: [
        {
          timestamp: Date.now(),
          action: 'created',
          by: values.assignedBy,
        },
      ],
    });
    revalidatePath(`/circles/${values.circleId}`);
    return { success: true, message: 'Task created successfully.' };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { success: false, message: error.message };
  }
}

const rejectTaskSchema = z.object({
  taskId: z.string(),
  circleId: z.string(),
  reason: z.string(),
  taskDescription: z.string(),
  overrideCode: z.string().optional(),
});

export async function rejectTask(values: z.infer<typeof rejectTaskSchema>) {
  // In a real app, you would validate the override code against the database.
  if (values.overrideCode && values.overrideCode === '4158') {
    const db = getDb();
    const taskRef = doc(db, `circles/${values.circleId}/tasks`, values.taskId);
    await updateDoc(taskRef, { status: 'rejected_by_override' });

    console.log(`Task ${values.taskId} rejected with override code.`);
    revalidatePath(`/circles/${values.circleId}`);
    revalidatePath('/dashboard');
    return { success: true, message: 'Task rejected with override code.' };
  }

  const validation = await validateRejectionReason({
    taskId: values.taskId,
    reason: values.reason,
    taskDescription: values.taskDescription,
  });

  if (validation.isValid) {
    const db = getDb();
    const taskRef = doc(db, `circles/${values.circleId}/tasks`, values.taskId);
    await updateDoc(taskRef, { status: 'pending_review' }); // Needs admin approval

    console.log(`Task ${values.taskId} rejection is valid, pending admin review.`);
    revalidatePath(`/circles/${values.circleId}`);
    revalidatePath('/dashboard');
    return { success: true, message: 'Task rejection submitted for admin review.' };
  } else {
    console.log(`Task ${values.taskId} rejection is invalid.`);
    return { success: false, message: validation.feedback };
  }
}

const updateTaskStatusSchema = z.object({
  taskId: z.string(),
  circleId: z.string(),
  status: z.string(), // Consider using a z.enum with your TaskStatus types
});

export async function updateTaskStatus(values: z.infer<typeof updateTaskStatusSchema>) {
    const db = getDb();
    const taskRef = doc(db, `circles/${values.circleId}/tasks`, values.taskId);
    try {
        await updateDoc(taskRef, { status: values.status });
        revalidatePath(`/circles/${values.circleId}`);
        revalidatePath('/dashboard');
        return { success: true, message: 'Task status updated.' };
    } catch (error: any) {
        console.error('Error updating task status:', error);
        return { success: false, message: error.message };
    }
}


const createUserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
});

export async function createUserProfile(
  values: z.infer<typeof createUserProfileSchema>
) {
  const db = getDb();
  const userRef = doc(db, 'users', values.userId);

  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: values.email || '',
        name: values.name || 'Anonymous User',
        role: 'staff_level_1', // Default role
        circles: [],
        ai_profile: {
          expertise: [],
          success_rate: 0.0,
          rejection_overrides: [],
        },
      });
      console.log(`Created user profile for ${values.userId}`);
      return { success: true, message: 'User profile created.' };
    } else {
      // console.log(`User profile for ${values.userId} already exists.`);
      return { success: true, message: 'User profile already exists.' };
    }
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { success: false, message: error.message };
  }
}
