import {
  getLikedPosts,
  getProfileByUsername,
  getUserPosts,
  isFollowing,
} from '@/actions/profile.action';
import ProfilePageClient from '@/components/ProfilePageClient';
import { notFound } from 'next/navigation';
import React, { use } from 'react';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getProfileByUsername(username);
  if (!user) {
    return;
  }

  return {
    title: `Profile | ${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

const ProfilePageServer = async ({
  params,
}: {
  params: { username: string };
}) => {
  const { username } = params;
  const user = await getProfileByUsername(username);
  if (!user) {
    notFound();
  }

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
};

export default ProfilePageServer;
