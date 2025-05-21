'use client'

import { User } from '@prisma/client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFollow } from '@/actions/user.action';

type Props = {
  // userId: User['id']
  userId: string;
};

const FollowButton = ({ userId }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true)

    try {
      await toggleFollow(userId)
      toast.success('User followed successfully!')
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Error following user!')
    } finally {
      setLoading(false)
    }
  };

  return (
    <Button
      size={'sm'}
      variant={'secondary'}
      onClick={handleFollow}
      disabled={loading}
      className='w-20'
    >
      {loading ? <Loader2 className='animate-spin size-4' /> : 'Follow'}
    </Button>
  );
};

export default FollowButton;
