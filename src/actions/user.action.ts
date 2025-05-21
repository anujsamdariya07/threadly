'use server';

import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

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
