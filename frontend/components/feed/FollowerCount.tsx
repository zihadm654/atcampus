'use client';

import { FollowerInfo } from '@/types/types';
import { formatNumber } from '@/lib/utils';
import useFollowerInfo from '@/hooks/useFollowerInfo';

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span className='flex items-center flex-col text-muted-foreground'>
      <span className='font-semibold text-blue-700'>
        {formatNumber(data.followers)}
      </span>
      Followers
    </span>
  );
}
