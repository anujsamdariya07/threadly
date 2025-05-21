'use server';

import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!user || !userId) {
      return;
    }

    // Check if user exists
    const exisitingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (exisitingUser) {
      return exisitingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log('Error in syncUser', error);
  }
};

export const getUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
};

export const getDBUserId = async () => {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error('Unauthorized!');
  }

  const user = await getUserByClerkId(clerkId);

  if (!user) {
    throw new Error('User not found!');
  }

  return user.id;
};

export const getRandomUsers = async () => {
  try {
    const userId = await getDBUserId();

    // Get 3 random users, exclude ourselves and users we alrady follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.error('Error fetching random users', error);
    return [];
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getDBUserId();

    if (userId === targetUserId) throw new Error('You cannot follow yourself!');

    const exisitingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (exisitingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: 'FOLLOW',
            userId: targetUserId, // user being followed
            creatorId: userId,
          },
        }),
      ]);
    }

    revalidatePath('/')

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in toggleFollow', error);
    return { success: false, error };
  }
};
