'use server';

import { prisma } from '@/lib/prisma';
import { getDBUserId } from './user.action';
import { revalidatePath } from 'next/cache';

export const createPost = async (content: string, imageUrl: string) => {
  try {
    const userId = await getDBUserId();

    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    });

    revalidatePath('/');

    return {
      success: true,
      post,
    };
  } catch (error) {
    console.error('Failed to create post:', error);
    return {
      success: false,
      error: 'Failed to create post!',
    };
  }
};
